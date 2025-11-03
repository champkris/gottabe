import { useState, useEffect } from 'react'
import { Clock, Calendar } from 'lucide-react'

interface AvailabilityCountdownProps {
  availableFrom: string | null
  availableTo: string | null
  compact?: boolean
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

export default function AvailabilityCountdown({
  availableFrom,
  availableTo,
  compact = false
}: AvailabilityCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [status, setStatus] = useState<'not-started' | 'active' | 'ended'>('active')

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const fromDate = availableFrom ? new Date(availableFrom) : null
      const toDate = availableTo ? new Date(availableTo) : null

      // Determine status
      if (fromDate && now < fromDate) {
        setStatus('not-started')
        const diff = fromDate.getTime() - now.getTime()
        setTimeRemaining(calculateTime(diff))
      } else if (toDate && now > toDate) {
        setStatus('ended')
        setTimeRemaining(null)
      } else if (toDate) {
        setStatus('active')
        const diff = toDate.getTime() - now.getTime()
        setTimeRemaining(calculateTime(diff))
      } else {
        setStatus('active')
        setTimeRemaining(null)
      }
    }

    const calculateTime = (ms: number): TimeRemaining => {
      const totalSeconds = Math.floor(ms / 1000)
      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = totalSeconds % 60

      return { days, hours, minutes, seconds, totalSeconds }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [availableFrom, availableTo])

  // Don't show anything if no dates are set
  if (!availableFrom && !availableTo) {
    return null
  }

  // Product hasn't started yet
  if (status === 'not-started' && timeRemaining) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-start gap-2">
          <Clock className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-yellow-600 flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-yellow-800`}>
              Coming Soon
            </p>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-yellow-700 mt-1`}>
              Available in: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
            </p>
            {!compact && availableFrom && (
              <p className="text-xs text-yellow-600 mt-1">
                Starts: {new Date(availableFrom).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Product has ended
  if (status === 'ended') {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-start gap-2">
          <Calendar className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-600 flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-800`}>
              No Longer Available
            </p>
            {!compact && availableTo && (
              <p className="text-xs text-gray-600 mt-1">
                Ended: {new Date(availableTo).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Product is active with limited time
  if (status === 'active' && timeRemaining) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-start gap-2">
          <Clock className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-red-600 flex-shrink-0 mt-0.5 animate-pulse`} />
          <div className="flex-1 min-w-0">
            <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-red-800`}>
              Limited Time Offer
            </p>

            {/* Countdown Timer */}
            <div className={`flex gap-2 ${compact ? 'mt-1' : 'mt-2'}`}>
              {timeRemaining.days > 0 && (
                <div className="text-center">
                  <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>
                    {timeRemaining.days}
                  </div>
                  <div className="text-xs text-red-600">days</div>
                </div>
              )}
              <div className="text-center">
                <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>
                  {String(timeRemaining.hours).padStart(2, '0')}
                </div>
                <div className="text-xs text-red-600">hrs</div>
              </div>
              <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>:</div>
              <div className="text-center">
                <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-red-600">min</div>
              </div>
              <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>:</div>
              <div className="text-center">
                <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-red-700`}>
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-red-600">sec</div>
              </div>
            </div>

            {/* Date Range Display */}
            {!compact && (
              <div className="mt-2 space-y-1">
                {availableFrom && (
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Started:</span> {new Date(availableFrom).toLocaleDateString()}
                  </p>
                )}
                {availableTo && (
                  <p className="text-xs text-red-600">
                    <span className="font-medium">Ends:</span> {new Date(availableTo).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-red-600">
                  <span className="font-medium">Total countdown:</span> {timeRemaining.totalSeconds.toLocaleString()} seconds remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
