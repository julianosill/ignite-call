import dayjs from 'dayjs'
import { useMemo } from 'react'

interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

export function useCalendarWeeks(date: dayjs.Dayjs) {
  const countCalendarWeeks = () => {
    const daysInMonthArray = Array.from({ length: date.daysInMonth() }).map(
      (_, index) => {
        const currentDate = date.set('date', index + 1)
        return {
          date: currentDate,
          disabled: currentDate.endOf('day').isBefore(new Date()),
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

  return useMemo(countCalendarWeeks, [date])
}
