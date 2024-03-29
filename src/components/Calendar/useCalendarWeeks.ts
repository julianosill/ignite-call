import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'

import { api } from '@/lib/axios'

interface useCalendarWeeksProps {
  date: dayjs.Dayjs
}

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

interface BlockedDates {
  blockedWeekDays: number[]
  blockedDates: number[]
}

export function useCalendarWeeks({ date }: useCalendarWeeksProps) {
  const router = useRouter()
  const username = String(router.query.username)

  const year = date.get('year')
  const month = String(date.get('month') + 1).padStart(2, '0')

  const { data: blockedDates } = useQuery<BlockedDates>({
    queryKey: ['blocked-dates', year, month],
    queryFn: async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: { year, month },
      })
      return response.data
    },
  })

  const countCalendarWeeks = () => {
    if (!blockedDates) {
      return []
    }

    const daysInMonthArray = Array.from({ length: date.daysInMonth() }).map(
      (_, index) => {
        const currentDate = date.set('date', index + 1)
        const isDisabled =
          currentDate.endOf('day').isBefore(new Date()) ||
          blockedDates?.blockedWeekDays.includes(currentDate.get('day')) ||
          blockedDates?.blockedDates.includes(currentDate.get('date'))

        return {
          date: currentDate,
          disabled: isDisabled,
        }
      },
    )

    const firstWeekDay = date.get('day')
    const lastDayInCurrentMonth = date.set('date', date.daysInMonth())
    const lastWeekDay = lastDayInCurrentMonth.get('day')

    const previousMonthFillArray = Array.from({ length: firstWeekDay }).map(
      (_, index) => {
        return {
          date: date.subtract(firstWeekDay - index, 'day'),
          disabled: true,
        }
      },
    )

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, index) => {
      return {
        date: lastDayInCurrentMonth.add(index + 1, 'day'),
        disabled: true,
      }
    })

    const calendarDays = [
      ...previousMonthFillArray,
      ...daysInMonthArray,
      ...nextMonthFillArray,
    ]

    const calendarWeeks: CalendarWeeks = []

    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push({
        week: i / 7,
        days: calendarDays.slice(i, i + 7),
      })
    }

    return calendarWeeks
  }

  return useMemo(countCalendarWeeks, [date, blockedDates])
}
