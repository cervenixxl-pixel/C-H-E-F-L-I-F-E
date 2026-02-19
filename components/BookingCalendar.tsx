
import React, { useState } from 'react';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  bookedDates?: Date[];
  className?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  selectedDate, 
  onDateSelect,
  selectedTime,
  onTimeSelect,
  bookedDates = [],
  className = "bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00", "17:00", "17:30", 
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    // Do not go back past current month if we are in current month
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    setCurrentMonth(prev);
  };
  
  const handleDateClick = (day: number) => {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (newDate < new Date(new Date().setHours(0,0,0,0))) return; // Disable past
      onDateSelect(newDate);
  }

  // Generate grid
  const renderCalendarDays = () => {
      const days = [];
      // Empty slots
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
      }
      // Days
      for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
          
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = new Date().toDateString() === date.toDateString();
          const isPast = date < new Date(new Date().setHours(0,0,0,0));
          
          const isBooked = bookedDates.some(bookedDate => 
            bookedDate.getDate() === date.getDate() &&
            bookedDate.getMonth() === date.getMonth() &&
            bookedDate.getFullYear() === date.getFullYear()
          );

          days.push(
              <button
                  key={d}
                  disabled={isPast || isBooked}
                  onClick={() => handleDateClick(d)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 relative
                      ${isSelected ? 'bg-brand-gold text-white shadow-xl scale-110 font-bold z-10 animate-in zoom-in-90' : ''}
                      ${!isSelected && !isPast && !isBooked ? 'hover:bg-brand-gold/10 hover:text-brand-dark text-gray-700 hover:scale-110' : ''}
                      ${isToday && !isSelected && !isBooked ? 'text-brand-gold font-bold border border-brand-gold/50' : ''}
                      ${isPast ? 'text-gray-300 cursor-not-allowed opacity-50' : ''}
                      ${isBooked ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through' : ''}
                  `}
                  title={isBooked ? "Fully Booked" : ""}
              >
                  {d}
              </button>
          );
      }
      return days;
  };

  return (
    <div className={className}>
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-6">Select a Date & Time</h3>
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <span className="font-medium text-gray-900">{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-8">
            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map(d => (
                    <div key={d} className="h-10 w-10 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 justify-items-center">
                {renderCalendarDays()}
            </div>
            <div className="mt-6 flex items-center justify-center space-x-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-brand-gold rounded-full mr-2 shadow-sm"></div> Selected
                </div>
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 border border-brand-gold rounded-full mr-2"></div> Today
                </div>
            </div>
        </div>

        {/* Time Selector */}
        <div className="border-t border-gray-100 pt-8">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Available Slots</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {timeSlots.map(time => (
                    <button
                        key={time}
                        onClick={() => onTimeSelect(time)}
                        className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all duration-300 border
                            ${selectedTime === time 
                                ? 'bg-brand-dark text-brand-gold border-brand-dark shadow-[0_10px_20px_rgba(0,0,0,0.1)] scale-105' 
                                : 'bg-white text-gray-600 border-gray-100 hover:border-brand-gold/30 hover:text-brand-gold hover:shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:scale-105'}
                        `}
                    >
                        {time}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default BookingCalendar;
