import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Bell,
  Trash2,
  Tag,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { eventAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

/**
 * Formats a Date object into YYYY-MM-DD in local time without UTC offset drift.
 */
export const formatLocalDate = (d) => {
  if (!d) return '';
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Parses YYYY-MM-DD into a local Date object.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr !== 'string') return new Date(dateStr);
  const parts = dateStr.split('T')[0].split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
};

const CATEGORIES = [
  { id: 'ALL', label: 'All Events' },
  { id: 'ACADEMIC', label: 'Academic', color: 'blue' },
  { id: 'EXAM', label: 'Exam', color: 'rose' },
  { id: 'ASSIGNMENT', label: 'Assignment', color: 'amber' },
  { id: 'WORKSHOP', label: 'Workshop / Lab', color: 'purple' },
  { id: 'HACKATHON', label: 'Hackathon', color: 'emerald' },
  { id: 'PERSONAL', label: 'Personal / Wellbeing', color: 'indigo' },
];

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-500',
    pill: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-500',
    pill: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500',
    pill: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500',
    pill: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-500',
    pill: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-500',
    pill: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200',
  },
};

export const EventCalendar = () => {
  const { showToast, fetchNotifications } = useNotification();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    title: '',
    description: '',
    date: formatLocalDate(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    category: 'ACADEMIC',
    color: 'blue',
    isAllDay: false,
    notify: true,
  }));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch events for current visible month
  const fetchMonthEvents = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getEvents({
        year,
        month: month + 1,
      });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load events:', err);
      showToast('Failed to load calendar events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthEvents();
  }, [year, month]);

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: daysInPrevMonth - i,
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const totalSlots = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
  const nextMonthDaysCount = totalSlots - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push({
      day: i,
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Helper date matches
  const isSameDay = (d1, d2) => {
    return formatLocalDate(d1) === formatLocalDate(d2);
  };

  const today = new Date();

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (filterCategory === 'ALL') return true;
    return ev.category === filterCategory;
  });

  const getEventsForDay = (date) => {
    return filteredEvents.filter((ev) => {
      const evDate = new Date(ev.date);
      return isSameDay(evDate, date);
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);
  const todayEvents = getEventsForDay(today);

  // Month Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Open modal pre-filling clicked day
  const handleOpenAddModal = (dateToSet) => {
    const target = dateToSet || selectedDate || new Date();
    setSelectedDate(target);
    const dateStr = formatLocalDate(target);
    setFormData({
      title: '',
      description: '',
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      category: 'ACADEMIC',
      color: 'blue',
      isAllDay: false,
      notify: true,
    });
    setIsModalOpen(true);
  };

  // Form Submit
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      showToast('Please enter an event title and date.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await eventAPI.createEvent(formData);
      const newEvent = res.data.event;

      // Update state
      setEvents((prev) => [...prev, newEvent]);
      setIsModalOpen(false);

      // Trigger Confetti
      confetti({ particleCount: 35, spread: 55 });

      // Refresh Topbar notification bell immediately
      fetchNotifications();

      // Show user feedback
      const formattedDay = parseLocalDate(formData.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (res.data.isToday) {
        showToast(`🔔 Event scheduled for today! Reminder added to notification bell.`, 'info');
      } else {
        showToast(`Event added on ${formattedDay}! You will be notified on that day.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;

    try {
      await eventAPI.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast('Event removed from planner.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete event.', 'error');
    }
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDayFormatted = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Today's Events Banner (if any) */}
      {todayEvents.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/80 dark:border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  Today's Events
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''} on your schedule
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                {todayEvents.map((e) => e.title).join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal(today)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event Today</span>
          </button>
        </div>
      )}

      {/* 2. Calendar Controls & Category Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          {/* Month selector & Today jump */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {monthName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any day to schedule events and receive automatic reminders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Today
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleOpenAddModal(selectedDate)}
              className="ml-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. Main Grid & Day Agenda layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-2">
          {/* Calendar Month Grid (8 or 12 cols) */}
          <div className="xl:col-span-8 flex flex-col">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-slate-100 dark:border-slate-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {allCalendarDays.map((slot, index) => {
                const dayEvents = getEventsForDay(slot.date);
                const isSelected = isSameDay(slot.date, selectedDate);
                const isTodayDate = isSameDay(slot.date, today);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(slot.date)}
                    className={`min-h-[92px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-900/10'
                        : isTodayDate
                        ? 'border-blue-300 dark:border-blue-700 bg-slate-50/60 dark:bg-slate-800/40'
                        : slot.isCurrentMonth
                        ? 'border-slate-100 dark:border-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        : 'border-transparent bg-slate-50/30 dark:bg-slate-900/30 opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Day number & Today badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isTodayDate
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isSelected
                            ? 'text-blue-600 dark:text-blue-400 font-black'
                            : slot.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {slot.day}
                      </span>

                      {/* Quick Add icon on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(slot.date);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-opacity"
                        title="Add event on this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Events pills for that day */}
                    <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const colorStyle = COLOR_CLASSES[ev.color] || COLOR_CLASSES.blue;
                        return (
                          <div
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate border ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`}
                            title={`${ev.title} (${ev.startTime || 'All Day'})`}
                          >
                            <span className="font-bold mr-1">{ev.startTime || '•'}</span>
                            {ev.title}
                          </div>
                        );
                      })}

                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 pl-1">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Selected Day Agenda (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {isSameDay(selectedDate, today) ? 'Today' : 'Selected Day'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {selectedDayFormatted}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(selectedDate)}
                    className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Add Event on this day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Day's Event List */}
                <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map((ev) => {
                      const colorStyle = COLOR_CLASSES[ev.color] || COLOR_CLASSES.blue;

                      return (
                        <div
                          key={ev.id}
                          className={`p-3 rounded-2xl border transition-all ${colorStyle.bg} ${colorStyle.border}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${colorStyle.pill}`}>
                                  {ev.category}
                                </span>
                                {ev.notify && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-0.5">
                                    <Bell className="w-2.5 h-2.5" />
                                    <span>Notified</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                                {ev.title}
                              </h4>

                              {ev.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                  {ev.description}
                                </p>
                              )}

                              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {ev.isAllDay ? 'All Day Event' : `${ev.startTime} – ${ev.endTime || 'End'}`}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No events on this day
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                        Add exams, assignments, labs, or personal goals to get notified.
                      </p>
                      <button
                        onClick={() => handleOpenAddModal(selectedDate)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Event for {selectedDate.getDate()}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminder Footer Note */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Bell className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Events automatically generate notifications on that day.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Add Event on That Day
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Schedule your event and get automatic notification on that day.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS Midterm, Hackathon Demo, Lab Viva"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, date: val });
                    if (val) {
                      setSelectedDate(parseLocalDate(val));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* All Day Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAllDay" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  All-day event
                </label>
              </div>

              {/* Times (if not all day) */}
              {!formData.isAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Category & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="EXAM">Exam</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="WORKSHOP">Workshop / Lab</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="PERSONAL">Personal / Wellbeing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Color Tag
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="rose">Rose</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Additional context, room number, or prep notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Notification Checkbox */}
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="notify"
                  checked={formData.notify}
                  onChange={(e) => setFormData({ ...formData, notify: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notify" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-bold block">Notify me about this event</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Receive an in-app notification in your top header bell on that day.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Adding...' : 'Add Event to Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
