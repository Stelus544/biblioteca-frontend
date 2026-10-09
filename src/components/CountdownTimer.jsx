import { useState, useEffect } from 'react';
import './CountdownTimer.css';

export default function CountdownTimer({ fechaVencimiento }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(fechaVencimiento) - new Date();
    if (difference <= 0) return null;

    return {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((difference / 1000 / 60) % 60),
      segundos: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [fechaVencimiento]);

  if (!timeLeft) {
    return <div className="timer-expired">⚠️ Préstamo Vencido</div>;
  }

  return (
    <div className="timer-container">
      <span>⌛ Tiempo restante:</span>
      <span>
        {timeLeft.dias}d {timeLeft.horas}h {timeLeft.minutos}m {timeLeft.segundos}s
      </span>
    </div>
  );
}