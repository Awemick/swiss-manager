'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, ArrowRight, Save, Settings, Users, Calendar, Trophy } from 'lucide-react'

const steps = [
  { id: 'basic', title: 'Basic Information', icon: Trophy },
  { id: 'settings', title: 'Tournament Settings', icon: Settings },
  { id: 'players', title: 'Player Setup', icon: Users },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
]

export default function NewTournamentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    type: 'SWISS' as const,
    rounds: 5,
    timeControl: '90+30',
    
    // Settings
    pointsWin: 1.0,
    pointsDraw: 0.5,
    pointsLoss: 0.0,
    tiebreak1: 'BUCHHOLZ' as const,
    tiebreak2: 'SONNEBORN_BERGER' as const,
    allowHalfPoints: true,
    autoPairing: true,
    ratingType: 'FIDE' as const,
    
    // Schedule
    startDate: '',
    endDate: '',
    location: '',
    director: '',
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const tournament = await response.json()
        router.push(`/tournaments/${tournament.id}`)
      } else {
        throw new Error('Failed to create tournament')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., World Chess Championship 2024"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Brief description of the tournament..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="type">Tournament System *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="SWISS">Swiss System</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="KNOCKOUT">Knockout</option>
                  <option value="TEAM">Team Tournament</option>
                </select>
              </div>

              <div>
                <Label htmlFor="rounds">Number of Rounds *</Label>
                <Input
                  id="rounds"
                  type="number"
                  min="1"
                  max="15"
                  value={formData.rounds}
                  onChange={(e) => updateFormData('rounds', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timeControl">Time Control</Label>
              <Input
                id="timeControl"
                value={formData.timeControl}
                onChange={(e) => updateFormData('timeControl', e.target.value)}
                placeholder="e.g., 90+30 (90 minutes with 30-second increment)"
                className="mt-1"
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pointsWin">Points for Win</Label>
                <Input
                  id="pointsWin"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.pointsWin}
                  onChange={(e) => updateFormData('pointsWin', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pointsDraw">Points for Draw</Label>
                <Input
                  id="pointsDraw"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.pointsDraw}
                  onChange={(e) => updateFormData('pointsDraw', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pointsLoss">Points for Loss</Label>
                <Input
                  id="pointsLoss"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.pointsLoss}
                  onChange={(e) => updateFormData('pointsLoss', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tiebreak1">Primary Tiebreak</Label>
                <select
                  id="tiebreak1"
                  value={formData.tiebreak1}
                  onChange={(e) => updateFormData('tiebreak1', e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="BUCHHOLZ">Buchholz</option>
                  <option value="SONNEBORN_BERGER">Sonneborn-Berger</option>
                  <option value="MEDIAN_BUCHHOLZ">Median Buchholz</option>
                  <option value="CUMULATIVE">Cumulative</option>
                  <option value="PROGRESSIVE">Progressive</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tiebreak2">Secondary Tiebreak</Label>
                <select
                  id="tiebreak2"
                  value={formData.tiebreak2}
                  onChange={(e) => updateFormData('tiebreak2', e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="SONNEBORN_BERGER">Sonneborn-Berger</option>
                  <option value="BUCHHOLZ">Buchholz</option>
                  <option value="MEDIAN_BUCHHOLZ">Median Buchholz</option>
                  <option value="CUMULATIVE">Cumulative</option>
                  <option value="PROGRESSIVE">Progressive</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allowHalfPoints" className="flex-1">
                  Allow Half Points
                  <p className="text-sm text-muted-foreground font-normal">Enable draw results (½-½)</p>
                </Label>
                <Switch
                  id="allowHalfPoints"
                  checked={formData.allowHalfPoints}
                  onCheckedChange={(checked) => updateFormData('allowHalfPoints', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoPairing" className="flex-1">
                  Automatic Pairing
                  <p className="text-sm text-muted-foreground font-normal">Generate pairings automatically each round</p>
                </Label>
                <Switch
                  id="autoPairing"
                  checked={formData.autoPairing}
                  onCheckedChange={(checked) => updateFormData('autoPairing', checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ratingType">Rating System</Label>
              <select
                id="ratingType"
                value={formData.ratingType}
                onChange={(e) => updateFormData('ratingType', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="FIDE">FIDE</option>
                <option value="USCF">USCF</option>
                <option value="ECF">ECF</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Player Management</h3>
              <p className="text-muted-foreground">
                Players can be added after tournament creation through the tournament management interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Manual Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Add players individually with their ratings and information.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Bulk Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Import players from CSV or copy/paste from existing lists.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="e.g., New York City, USA"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="director">Tournament Director</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => updateFormData('director', e.target.value)}
                placeholder="Name of the chief arbiter/director"
                className="mt-1"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tournament Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{formData.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span>System:</span>
                  <span className="font-medium">{formData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rounds:</span>
                  <span className="font-medium">{formData.rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Control:</span>
                  <span className="font-medium">{formData.timeControl || 'Not set'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const CurrentStepIcon = steps[currentStep].icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Tournament</h1>
          <p className="text-muted-foreground">Set up your chess tournament with professional settings</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted border-muted-foreground/30'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CurrentStepIcon className="w-5 h-5" />
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}

          <div className="flex justify-between pt-6 mt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Tournament'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}