import { Player, Match, Tournament } from '@prisma/client'

interface PlayerWithStats extends Player {
  opponents: string[]  // Array of opponent player IDs
  colorHistory: ('WHITE' | 'BLACK')[]
  score: number
  rating: number
}

interface PairingResult {
  whitePlayerId: string
  blackPlayerId: string
  boardNumber: number
}

export class SwissPairing {
  static pairRound(
    players: PlayerWithStats[], 
    previousMatches: Match[], 
    roundNumber: number
  ): PairingResult[] {
    // Sort players by score, then rating
    const sortedPlayers = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (b.rating || 0) - (a.rating || 0)
    })

    const paired: Set<string> = new Set()
    const results: PairingResult[] = []
    let boardNumber = 1

    // Group players by score groups
    const scoreGroups = this.groupByScore(sortedPlayers)

    // Handle bye for odd number of players
    if (sortedPlayers.length % 2 !== 0) {
      const byePlayer = this.findByePlayer(sortedPlayers, previousMatches)
      if (byePlayer) {
        paired.add(byePlayer.id)
        // Bye will be handled separately in the match creation
      }
    }

    // Pair each score group
    for (const score of Object.keys(scoreGroups).sort((a, b) => Number(b) - Number(a))) {
      const group = scoreGroups[parseFloat(score)]
      const unpairedInGroup: PlayerWithStats[] = []

      for (const player of group) {
        if (paired.has(player.id)) continue

        const opponent = this.findSuitableOpponent(player, group, paired, previousMatches)
        
        if (opponent) {
          const color = this.determineColor(player, opponent)
          
          results.push({
            whitePlayerId: color === 'WHITE' ? player.id : opponent.id,
            blackPlayerId: color === 'WHITE' ? opponent.id : player.id,
            boardNumber: boardNumber++
          })

          paired.add(player.id)
          paired.add(opponent.id)
        } else {
          unpairedInGroup.push(player)
        }
      }

      // Handle unpaired players in this group (float up/down)
      this.handleUnpairedPlayers(unpairedInGroup, scoreGroups, paired, results, previousMatches, boardNumber)
    }

    return results
  }

  private static groupByScore(players: PlayerWithStats[]): { [score: number]: PlayerWithStats[] } {
    return players.reduce((groups, player) => {
      const score = player.score
      if (!groups[score]) groups[score] = []
      groups[score].push(player)
      return groups
    }, {} as { [score: number]: PlayerWithStats[] })
  }

  private static findByePlayer(players: PlayerWithStats[], previousMatches: Match[]): PlayerWithStats | null {
    // Prefer giving bye to lowest-rated player who hasn't had one recently
    const playersWithByeHistory = previousMatches
      .filter(m => m.result === 'WHITE_BYE' || m.result === 'BLACK_BYE')
      .map(m => m.result === 'WHITE_BYE' ? m.whitePlayerId : m.blackPlayerId)

    return players
      .filter(p => !playersWithByeHistory.includes(p.id))
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))[0] || null
  }

  private static findSuitableOpponent(
    player: PlayerWithStats,
    group: PlayerWithStats[],
    paired: Set<string>,
    previousMatches: Match[]
  ): PlayerWithStats | null {
    // Filter out already paired players and self
    const candidates = group.filter(p => 
      p.id !== player.id && 
      !paired.has(p.id) &&
      !player.opponents.includes(p.id)
    )

    if (candidates.length === 0) return null

    // Prefer opponents with similar rating and different color history
    return candidates.sort((a, b) => {
      // Priority 1: Haven't played before
      const aPlayed = player.opponents.includes(a.id)
      const bPlayed = player.opponents.includes(b.id)
      if (aPlayed !== bPlayed) return aPlayed ? 1 : -1

      // Priority 2: Color balance
      const aColorBalance = this.calculateColorPreference(player, a)
      const bColorBalance = this.calculateColorPreference(player, b)
      if (aColorBalance !== bColorBalance) return bColorBalance - aColorBalance

      // Priority 3: Rating proximity
      const aRatingDiff = Math.abs((player.rating || 0) - (a.rating || 0))
      const bRatingDiff = Math.abs((player.rating || 0) - (b.rating || 0))
      return aRatingDiff - bRatingDiff
    })[0] || null
  }

  private static determineColor(player1: PlayerWithStats, player2: PlayerWithStats): 'WHITE' | 'BLACK' {
    const p1WhiteGames = player1.colorHistory.filter(c => c === 'WHITE').length
    const p1BlackGames = player1.colorHistory.filter(c => c === 'BLACK').length
    const p2WhiteGames = player2.colorHistory.filter(c => c === 'WHITE').length
    const p2BlackGames = player2.colorHistory.filter(c => c === 'BLACK').length

    const p1Balance = p1WhiteGames - p1BlackGames
    const p2Balance = p2WhiteGames - p2BlackGames

    if (p1Balance < p2Balance) return 'WHITE'
    if (p1Balance > p2Balance) return 'BLACK'
    
    // If equal, randomize but consider previous colors
    const p1LastWhite = player1.colorHistory[player1.colorHistory.length - 1] === 'WHITE'
    const p2LastWhite = player2.colorHistory[player2.colorHistory.length - 1] === 'WHITE'
    
    if (p1LastWhite && !p2LastWhite) return 'BLACK'
    if (!p1LastWhite && p2LastWhite) return 'WHITE'
    
    return Math.random() > 0.5 ? 'WHITE' : 'BLACK'
  }

  private static calculateColorPreference(player1: PlayerWithStats, player2: PlayerWithStats): number {
    // Calculate how desirable this pairing is based on color history
    let score = 0
    
    const p1WhiteCount = player1.colorHistory.filter(c => c === 'WHITE').length
    const p1BlackCount = player1.colorHistory.filter(c => c === 'BLACK').length
    const p2WhiteCount = player2.colorHistory.filter(c => c === 'WHITE').length
    const p2BlackCount = player2.colorHistory.filter(c => c === 'BLACK').length

    // Prefer giving white to player with fewer white games
    if (p1WhiteCount < p2WhiteCount) score += 2
    if (p1BlackCount < p2BlackCount) score -= 2

    // Avoid three of the same color in a row
    const p1LastTwo = player1.colorHistory.slice(-2)
    const p2LastTwo = player2.colorHistory.slice(-2)
    
    if (p1LastTwo.length === 2 && p1LastTwo[0] === p1LastTwo[1]) score += 1
    if (p2LastTwo.length === 2 && p2LastTwo[0] === p2LastTwo[1]) score += 1

    return score
  }

  private static handleUnpairedPlayers(
    unpaired: PlayerWithStats[],
    scoreGroups: { [score: number]: PlayerWithStats[] },
    paired: Set<string>,
    results: PairingResult[],
    previousMatches: Match[],
    boardNumber: number
  ) {
    // Implementation for handling players who couldn't be paired in their score group
    // This would involve floating players up or down to adjacent score groups
    // Complex logic omitted for brevity
  }
}