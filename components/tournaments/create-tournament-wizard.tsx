'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

const steps = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'settings', title: 'Settings' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'review', title: 'Review' },
]

export function CreateTournamentWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SWISS',
    rounds: 5,
    timeControl: '',
    startDate: '',
    endDate: '',
    location: '',
    director: '',
    pointsWin: 1.0,
    pointsDraw: 0.5,
    pointsLoss: 0.0,
    tiebreak1: 'BUCHHOLZ',
    tiebreak2: 'SONNEBORN_BERGER',
    allowHalfPoints: true,
    autoPairing: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const tournament = await response.json()
        router.push(`/tournaments/${tournament.id}`)
      } else {
        console.error('Failed to create tournament')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., World Chess Championship"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe the tournament..."
              />
            </div>
            <div>
              <Label htmlFor="type">Tournament Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => updateFormData('type', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SWISS">Swiss System</option>
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="KNOCKOUT">Knockout</option>
                <option value="TEAM">Team Tournament</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rounds">Number of Rounds</Label>
              <Input
                id="rounds"
                type="number"
                min="1"
                value={formData.rounds}
                onChange={(e) => updateFormData('rounds', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="timeControl">Time Control</Label>
              <Input
                id="timeControl"
                value={formData.timeControl}
                onChange={(e) => updateFormData('timeControl', e.target.value)}
                placeholder="e.g., 90+30"
              />
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pointsWin">Points for Win</Label>
                <Input
                  id="pointsWin"
                  type="number"
                  step="0.5"
                  value={formData.pointsWin}
                  onChange={(e) => updateFormData('pointsWin', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="pointsDraw">Points for Draw</Label>
                <Input
                  id="pointsDraw"
                  type="number"
                  step="0.5"
                  value={formData.pointsDraw}
                  onChange={(e) => updateFormData('pointsDraw', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="pointsLoss">Points for Loss</Label>
                <Input
                  id="pointsLoss"
                  type="number"
                  step="0.5"
                  value={formData.pointsLoss}
                  onChange={(e) => updateFormData('pointsLoss', parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tiebreak1">Primary Tiebreak</Label>
              <select
                id="tiebreak1"
                value={formData.tiebreak1}
                onChange={(e) => updateFormData('tiebreak1', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="BUCHHOLZ">Buchholz</option>
                <option value="SONNEBORN_BERGER">Sonneborn-Berger</option>
                <option value="MEDIAN_BUCHHOLZ">Median Buchholz</option>
                <option value="CUMULATIVE">Cumulative</option>
                <option value="PROGRESSIVE">Progressive</option>
                <option value="KASPAROV">Kasparov</option>
                <option value="AVERAGE_RATING">Average Rating</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tiebreak2">Secondary Tiebreak</Label>
              <select
                id="tiebreak2"
                value={formData.tiebreak2}
                onChange={(e) => updateFormData('tiebreak2', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="BUCHHOLZ">Buchholz</option>
                <option value="SONNEBORN_BERGER">Sonneborn-Berger</option>
                <option value="MEDIAN_BUCHHOLZ">Median Buchholz</option>
                <option value="CUMULATIVE">Cumulative</option>
                <option value="PROGRESSIVE">Progressive</option>
                <option value="KASPAROV">Kasparov</option>
                <option value="AVERAGE_RATING">Average Rating</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowHalfPoints"
                checked={formData.allowHalfPoints}
                onChange={(e) => updateFormData('allowHalfPoints', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="allowHalfPoints">Allow Half Points</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoPairing"
                checked={formData.autoPairing}
                onChange={(e) => updateFormData('autoPairing', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="autoPairing">Auto Pairing</Label>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="e.g., New York, USA"
              />
            </div>
            <div>
              <Label htmlFor="director">Tournament Director</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => updateFormData('director', e.target.value)}
                placeholder="Name of the director"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Name:</strong> {formData.name}
              </div>
              <div>
                <strong>Type:</strong> {formData.type}
              </div>
              <div>
                <strong>Rounds:</strong> {formData.rounds}
              </div>
              <div>
                <strong>Time Control:</strong> {formData.timeControl}
              </div>
              <div>
                <strong>Start Date:</strong> {formData.startDate}
              </div>
              <div>
                <strong>End Date:</strong> {formData.endDate}
              </div>
              <div>
                <strong>Location:</strong> {formData.location}
              </div>
              <div>
                <strong>Director:</strong> {formData.director}
              </div>
            </div>
            <div>
              <strong>Points:</strong> Win: {formData.pointsWin}, Draw: {formData.pointsDraw}, Loss: {formData.pointsLoss}
            </div>
            <div>
              <strong>Tiebreaks:</strong> Primary: {formData.tiebreak1}, Secondary: {formData.tiebreak2}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Tournament</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">{renderStep()}</div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Tournament'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}