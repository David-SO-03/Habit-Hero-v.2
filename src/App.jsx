import './App.css'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Settings, RotateCcw, ChevronRight, Calendar, ShoppingBag, Heart, Coins } from 'lucide-react';

// Configuración por defecto
const DEFAULT_CONFIG = {
  groups: [
    {
      id: 1,
      name: "Salud",
      angle: 0,
      color: "#ef4444",
      tasks: [
        { id: 1, name: "Hacer ejercicio", weight: 40, completed: false },
        { id: 2, name: "Descansar bien", weight: 30, completed: false },
        { id: 3, name: "Meditar", weight: 30, completed: false }
      ]
    },
    {
      id: 2,
      name: "Trabajo",
      angle: 60,
      color: "#f59e0b",
      tasks: [
        { id: 4, name: "Completar proyecto principal", weight: 50, completed: false },
        { id: 5, name: "Responder emails", weight: 25, completed: false },
        { id: 6, name: "Planificar semana", weight: 25, completed: false }
      ]
    },
    {
      id: 3,
      name: "Relaciones",
      angle: 120,
      color: "#10b981",
      tasks: [
        { id: 7, name: "Llamar a familia", weight: 40, completed: false },
        { id: 8, name: "Salir con amigos", weight: 30, completed: false },
        { id: 9, name: "Tiempo en pareja", weight: 30, completed: false }
      ]
    },
    {
      id: 4,
      name: "Aprendizaje",
      angle: 180,
      color: "#3b82f6",
      tasks: [
        { id: 10, name: "Leer 30 minutos", weight: 40, completed: false },
        { id: 11, name: "Curso online", weight: 35, completed: false },
        { id: 12, name: "Practicar idioma", weight: 25, completed: false }
      ]
    },
    {
      id: 5,
      name: "Ocio",
      angle: 240,
      color: "#8b5cf6",
      tasks: [
        { id: 13, name: "Hobby creativo", weight: 40, completed: false },
        { id: 14, name: "Ver serie/película", weight: 30, completed: false },
        { id: 15, name: "Jugar videojuegos", weight: 30, completed: false }
      ]
    },
    {
      id: 6,
      name: "Finanzas",
      angle: 300,
      color: "#ec4899",
      tasks: [
        { id: 16, name: "Revisar gastos", weight: 35, completed: false },
        { id: 17, name: "Ahorrar/invertir", weight: 40, completed: false },
        { id: 18, name: "Planificar presupuesto", weight: 25, completed: false }
      ]
    }
  ],
  weekStart: new Date().toISOString().split('T')[0],
  weekHistory: [],
  
  // ⭐ NUEVO: Sistema de economía
  coins: 0, // Monedas actuales
  coinsPerGroup: 10, // Monedas por completar grupo (configurable)
  totalCoinsEarned: 0, // Histórico
  weekCoinsEarned: 0, // Esta semana
  
  // ⭐ NUEVO: Sistema de vida
  health: 100, // Vida actual
  maxHealth: 100, // Vida máxima
  healthLossPerIncompleteGroup: 15, // Vida que pierdes por grupo incompleto
  isDead: false, // Estado de muerte
  deathPenalty: "Hacer 50 flexiones", // Castigo configurable
  weeklyHealthRegenUsed: [], // IDs de grupos que ya regeneraron
  
  // ⭐ NUEVO: Tienda
  shopItems: [
    { 
      id: 1, 
      name: "Saltar una tarea", 
      description: "Puedes saltar una tarea esta semana", 
      price: 30, 
      type: "skip_task",
      icon: "⏭️"
    },
    { 
      id: 2, 
      name: "Día libre", 
      description: "Completa automáticamente un grupo", 
      price: 50, 
      type: "complete_group",
      icon: "🎁"
    },
    { 
      id: 3, 
      name: "Poción de vida", 
      description: "Recupera 20 puntos de vida", 
      price: 25, 
      type: "heal",
      icon: "❤️"
    }
  ],
  purchasedItems: [] // Items comprados esta semana
};

const getDefaultConfig = () => JSON.parse(JSON.stringify(DEFAULT_CONFIG));

function HabitHeroWeekly() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedWeekHistory, setSelectedWeekHistory] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [epicAnimationTriggered, setEpicAnimationTriggered] = useState(false);
  const [showEpicAnimation, setShowEpicAnimation] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  
  // Ref para hacer scroll al hexágono
  const hexagonRef = useRef(null);

  // Cargar datos guardados
  useEffect(() => {
    loadGameData();
  }, []);

  // Registrar Service Worker y pedir permisos de notificación
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.log('Error al registrar Service Worker:', error);
      }
    }
  };

  // Pedir permisos de notificación al iniciar la app
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Verificar y enviar notificaciones cuando carguen los datos
  useEffect(() => {
    if (config.weekStart) {
      checkAndSendNotifications();
    }
  }, [config.weekStart, config.groups]);

  useEffect(() => {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }, []); // se ejecuta al montar el componente

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log('Error al pedir permisos de notificación:', error);
      }
    }
  };

  const checkAndSendNotifications = () => {
    // Solo si tenemos permisos
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const daysLeft = getDaysLeftInWeek();
    const isComplete = isWeekComplete();

    // Notificación 1: Queda 1 día y NO está completo
    if (daysLeft === 1 && !isComplete) {
      const notifKey = `notif-last-day-${config.weekStart}`;
      const alreadySent = localStorage.getItem(notifKey);
      
      if (!alreadySent) {
        sendNotification(
          '⏰ ¡Último día de la semana!',
          'Todavía puedes completar tus objetivos. ¡Tú puedes! 💪',
          '⏰'
        );
        localStorage.setItem(notifKey, 'true');
      }
    }

    // Notificación 2: Nueva semana (día 0 o 1, y no se había notificado)
    if (daysLeft >= 6 && daysLeft <= 7) {
      const notifKey = `notif-new-week-${config.weekStart}`;
      const alreadySent = localStorage.getItem(notifKey);
      
      if (!alreadySent) {
        sendNotification(
          '🎯 ¡Nueva semana comenzó!',
          'Empieza fuerte y alcanza tus metas. ¡Vamos! 🚀',
          '🎯'
        );
        localStorage.setItem(notifKey, 'true');
      }
    }
  };

  const sendNotification = (title, body, icon) => {
    // Verificar si la página está visible (no enviar si ya está abierta)
    if (document.hidden) {
      new Notification(title, {
        body: body,
        icon: icon,
        badge: icon,
        vibrate: [200, 100, 200],
        tag: 'habit-hero-notification',
        requireInteraction: false,
      });
    } else {
      // Si la app está abierta, mostrar un banner discreto en lugar de notificación
      showInAppBanner(title, body);
    }
  };

  const showInAppBanner = (title, message) => {
    // Crear banner temporal
    const banner = document.createElement('div');
    banner.className = 'notification-banner';
    banner.innerHTML = `
      <div class="notification-banner-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(banner);

    // Animar entrada
    setTimeout(() => banner.classList.add('show'), 100);

    // Remover después de 5 segundos
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }, 5000);
  };

  // Resetear el estado de animación épica cuando cambia la semana
  useEffect(() => {
    setEpicAnimationTriggered(false);
    setShowEpicAnimation(false);
    setCelebrationShown(false);
  }, [config.weekStart]);

  useEffect(() => {
    if (config.isDead && !showDeathScreen) {
      setShowDeathScreen(true);
    }
  }, [config.isDead]);

  const loadGameData = async () => {
    try {
      if (window.storage) {
        const result = await window.storage.get('habit-hero-weekly');
        if (result && result.value) {
          const savedData = JSON.parse(result.value);
          
          // Verificar si es una nueva semana
          const savedWeekStart = new Date(savedData.weekStart);
          const today = new Date();
          const daysSinceStart = Math.floor((today - savedWeekStart) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart >= 7) {
            // Guardar semana completada en historial
            const weekEnd = new Date(savedWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // Último día de la semana

            // ⭐ NUEVO: Calcular pérdida de vida
            const incompleteGroups = savedData.groups.filter(g => calculateGroupProgress(g) < 100);
            const healthLoss = incompleteGroups.length * (savedData.healthLossPerIncompleteGroup || 15);
            const newHealth = Math.max(0, (savedData.health || 100) - healthLoss);
            
            const weekRecord = {
              weekStart: savedData.weekStart,
              weekEnd: weekEnd.toISOString().split('T')[0],
              groups: JSON.parse(JSON.stringify(savedData.groups)), // Copia profunda
              coinsEarned: savedData.weekCoinsEarned || 0,
              healthLost: healthLoss // ⭐ NUEVO
            };
            
            // Añadir al historial y limitar a 52 semanas
            const updatedHistory = [weekRecord, ...(savedData.weekHistory || [])].slice(0, 52);
            
            // Nueva semana - resetear tareas pero mantener configuración
            const resetData = {
              ...savedData,
              groups: savedData.groups.map(group => ({
                ...group,
                tasks: group.tasks.map(task => ({
                  ...task,
                  completed: false
                }))
              })),
              weekStart: today.toISOString().split('T')[0],
              weekHistory: updatedHistory,
              health: newHealth, // ⭐ NUEVO
              isDead: newHealth === 0, // ⭐ NUEVO
              weeklyHealthRegenUsed: [], // ⭐ NUEVO: Resetear regeneración
              purchasedItems: [], // ⭐ NUEVO: Limpiar items comprados
              weekCoinsEarned: 0 // ⭐ NUEVO
            };
            
            // Limpiar flag de celebración de la semana anterior
            const oldCelebrationKey = `celebration-shown-${savedData.weekStart}`;
            localStorage.removeItem(oldCelebrationKey);
            
            setConfig(resetData);
            await saveGameData(resetData);
          } else {
            // Asegurar que weekHistory existe
            const dataWithHistory = {
              ...savedData,
              weekHistory: savedData.weekHistory || []
            };
            setConfig(dataWithHistory);
          }
        }
      } else if (localStorage) {
        const savedData = localStorage.getItem('habit-hero-weekly');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          // Verificar si es una nueva semana
          const savedWeekStart = new Date(parsed.weekStart);
          const today = new Date();
          const daysSinceStart = Math.floor((today - savedWeekStart) / (1000 * 60 * 60 * 24));
          
          if (daysSinceStart >= 7) {
            // Guardar semana completada en historial
            const weekEnd = new Date(savedWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const weekRecord = {
              weekStart: parsed.weekStart,
              weekEnd: weekEnd.toISOString().split('T')[0],
              groups: JSON.parse(JSON.stringify(parsed.groups))
            };
            
            const updatedHistory = [weekRecord, ...(parsed.weekHistory || [])].slice(0, 52);
            
            const resetData = {
              ...parsed,
              groups: parsed.groups.map(group => ({
                ...group,
                tasks: group.tasks.map(task => ({
                  ...task,
                  completed: false
                }))
              })),
              weekStart: today.toISOString().split('T')[0],
              weekHistory: updatedHistory
            };
            
            // Limpiar flag de celebración de la semana anterior
            const oldCelebrationKey = `celebration-shown-${parsed.weekStart}`;
            localStorage.removeItem(oldCelebrationKey);
            
            setConfig(resetData);
            localStorage.setItem('habit-hero-weekly', JSON.stringify(resetData));
          } else {
            const dataWithHistory = {
              ...parsed,
              weekHistory: parsed.weekHistory || []
            };
            setConfig(dataWithHistory);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveGameData = async (data) => {
    try {
      if (window.storage) {
        await window.storage.set('habit-hero-weekly', JSON.stringify(data));
      } else if (localStorage) {
        localStorage.setItem('habit-hero-weekly', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const updateConfig = (updates) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveGameData(newConfig);
  };

  // Secuencia épica de celebración cuando se completa la última tarea
  const triggerEpicCelebration = useCallback(() => {
    // Verificar INMEDIATAMENTE si ya se mostró esta semana
    const celebrationKey = `celebration-shown-${config.weekStart}`;
    const alreadyShown = localStorage.getItem(celebrationKey);
    
    if (alreadyShown) {
      return; // Salir inmediatamente si ya se mostró
    }
    
    // Verificar si el modal ya está abierto
    if (showCelebration) {
      return;
    }
    
    // Marcar como mostrada ANTES de hacer cualquier cosa
    localStorage.setItem(celebrationKey, 'true');
    
    // 1. Activar la animación épica del hexágono
    setShowEpicAnimation(true);
    
    // 2. Cerrar el panel de tareas
    setSelectedGroupId(null);
    
    // 3. Hacer scroll suave al hexágono
    setTimeout(() => {
      if (hexagonRef.current) {
        hexagonRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300);
    
    // 4. Desactivar la animación después de que termine (1.5s)
    setTimeout(() => {
      setShowEpicAnimation(false);
    }, 1800);
    
    // 5. Mostrar el modal de celebración
    setTimeout(() => {
      setShowCelebration(true);
      setCelebrationShown(true);
    }, 2100); // 300ms (cierre panel) + 1800ms (animación hexágono)
  }, [config.weekStart, showCelebration]);

  const toggleTask = useCallback((groupId, taskId) => {
    // Verificar PRIMERO si ya se mostró la celebración esta semana
    const celebrationKey = `celebration-shown-${config.weekStart}`;
    const alreadyShown = localStorage.getItem(celebrationKey);
    const group = config.groups.find(g => g.id === groupId);
    const task = group.tasks.find(t => t.id === taskId);
    const wasGroupComplete = calculateGroupProgress(group) === 100;
    
    // Verificar estado ANTES del toggle
    const wasComplete = isWeekComplete();
    
    const updatedGroups = config.groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: group.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return group;
    });
  
    let updates = { groups: updatedGroups };
        // Calcular si el grupo se completó ahora
    const updatedGroup = updatedGroups.find(g => g.id === groupId);
    const isGroupCompleteNow = calculateGroupProgress(updatedGroup) === 100;
    
    // ⭐ NUEVO: Si el grupo se acaba de completar
    if (!wasGroupComplete && isGroupCompleteNow) {
      // Dar monedas
      const coinsEarned = config.coinsPerGroup || 10;
      updates.coins = (config.coins || 0) + coinsEarned;
      updates.totalCoinsEarned = (config.totalCoinsEarned || 0) + coinsEarned;
      updates.weekCoinsEarned = (config.weekCoinsEarned || 0) + coinsEarned;
      
      // Dar vida (solo si no se ha usado esta semana)
      const healthRegenUsed = config.weeklyHealthRegenUsed || [];
      if (!healthRegenUsed.includes(groupId) && config.health < config.maxHealth) {
        const healthGain = 2;
        updates.health = Math.min(config.maxHealth, (config.health || 100) + healthGain);
        updates.weeklyHealthRegenUsed = [...healthRegenUsed, groupId];
        
        // Mostrar notificación
        showRewardNotification(coinsEarned, healthGain);
      } else {
        showRewardNotification(coinsEarned, 0);
      }
    }
    
    // ⭐ NUEVO: Si el grupo se "descompletó"
    if (wasGroupComplete && !isGroupCompleteNow) {
      const coinsToRemove = config.coinsPerGroup || 10;
      updates.coins = Math.max(0, (config.coins || 0) - coinsToRemove);
      updates.totalCoinsEarned = Math.max(0, (config.totalCoinsEarned || 0) - coinsToRemove);
      updates.weekCoinsEarned = Math.max(0, (config.weekCoinsEarned || 0) - coinsToRemove);
      updates.weeklyHealthRegenUsed = (config.weeklyHealthRegenUsed || []).filter(id => id !== groupId);
    }
    
    // Calcular si quedará completo DESPUÉS del toggle
    const willBeComplete = updatedGroups.every(group => {
      const completedWeight = group.tasks
        .filter(task => task.completed)
        .reduce((sum, task) => sum + task.weight, 0);
      return completedWeight === 100;
    });
    
    // Si NO estaba completo y AHORA sí lo está, Y NO se ha mostrado ya, disparar secuencia épica
    if (!wasComplete && willBeComplete && !epicAnimationTriggered && !alreadyShown) {
      setEpicAnimationTriggered(true);
      triggerEpicCelebration();
    }
    
    updateConfig({ groups: updatedGroups });
  }, [config.groups, config.weekStart, epicAnimationTriggered, triggerEpicCelebration]);

  const calculateGroupProgress = (group) => {
    const completedWeight = group.tasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);
    return completedWeight; // Ya está en porcentaje (0-100)
  };

  const calculateOverallProgress = () => {
    const totalProgress = config.groups.reduce((sum, group) => {
      return sum + calculateGroupProgress(group);
    }, 0);
    return (totalProgress / config.groups.length).toFixed(1);
  };

  const getDaysLeftInWeek = () => {
    const weekStart = new Date(config.weekStart);
    const today = new Date();
    const daysPassed = Math.floor((today - weekStart) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysPassed);
  };

  const isWeekComplete = () => {
    return config.groups.every(group => {
      const progress = calculateGroupProgress(group);
      return progress === 100;
    });
  };

  // Funciones memorizadas para evitar re-renders
  const handleCloseTasksPanel = useCallback(() => {
    setSelectedGroupId(null);
  }, []);

  const showRewardNotification = (coins, health) => {
    const banner = document.createElement('div');
    banner.className = 'reward-notification';
    banner.innerHTML = `
      <div class="reward-content">
        <strong>¡Grupo Completado!</strong>
        <div class="rewards">
          <span class="reward-item">+${coins} 🪙</span>
          ${health > 0 ? `<span class="reward-item">+${health} ❤️</span>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    
    setTimeout(() => banner.classList.add('show'), 100);
    setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  // Componente del Hexágono
  const HexagonView = () => {
    const centerX = 250;
    const centerY = 250;
    const baseRadius = 20; // Radio mínimo (centro)
    const maxRadius = 160; // Radio máximo

    const calculateRadius = (percentage) => {
      return baseRadius + (maxRadius - baseRadius) * (percentage / 100);
    };

    const getPoint = (angle, radius) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(radians - Math.PI / 2),
        y: centerY + radius * Math.sin(radians - Math.PI / 2)
      };
    };

    const createHexagonPath = (radiusFunc) => {
      const points = config.groups.map(group => {
        const radius = radiusFunc(group);
        return getPoint(group.angle, radius);
      });
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    };

    const overallProgress = calculateOverallProgress();
    const isComplete = config.groups.every(group => calculateGroupProgress(group) === 100);

    return (
      <div className="screen-content">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">📊 Progreso Semanal</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
              <span className="progress-text">{overallProgress}%</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-label">⏰ Días Restantes</span>
            <div className="days-week-container">
              {/* Fila de 7 círculos representando la semana */}
              <div className="week-dots">
                {[...Array(7)].map((_, index) => {
                  const dayPassed = index < (7 - getDaysLeftInWeek());
                  
                  return (
                    <div 
                      key={index} 
                      className={`week-dot ${dayPassed ? 'passed' : 'remaining'}`}
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {dayPassed && (
                        <div className="week-dot-glow"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Número grande y texto */}
              <div className="days-number-display">
                <span className="days-big-number">{getDaysLeftInWeek()}</span>
                <span className="days-text">día{getDaysLeftInWeek() !== 1 ? 's' : ''} restante{getDaysLeftInWeek() !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={hexagonRef} className={`hexagon-container ${showEpicAnimation ? 'complete' : ''}`}>
          <svg className="hexagon-svg" viewBox="0 0 500 500">
            {/* Definir gradientes y filtros */}
            <defs>
              {/* Gradiente para el hexágono de progreso */}
              <radialGradient id="hexGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
              </radialGradient>

              {/* Sombra para el hexágono */}
              <filter id="hexShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
                <feOffset dx="0" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Glow para cuando está completo */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Círculos concéntricos de fondo */}
            <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="250" cy="250" r="120" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="250" cy="250" r="80" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="250" cy="250" r="40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

            {/* Hexágono de referencia (100%) */}
            <path
              d={createHexagonPath(() => maxRadius)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Hexágono de progreso actual con gradiente */}
            <path
              className="hex-progress"
              d={createHexagonPath((group) => calculateRadius(calculateGroupProgress(group)))}
              fill="url(#hexGradient)"
              stroke={isComplete ? "#10b981" : "#6366f1"}
              strokeWidth="3"
              filter="url(#hexShadow)"
            />

            {/* Líneas desde el centro a cada nodo con gradiente */}
            {config.groups.map(group => {
              const progress = calculateGroupProgress(group);
              const radius = calculateRadius(progress);
              const point = getPoint(group.angle, radius);
              
              return (
                <g key={`line-group-${group.id}`}>
                  {/* Definir gradiente específico para esta línea usando coordenadas exactas */}
                  <defs>
                    <linearGradient 
                      id={`line-gradient-${group.id}`}
                      x1={centerX}
                      y1={centerY}
                      x2={point.x}
                      y2={point.y}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                      <stop offset="100%" stopColor={group.color} />
                    </linearGradient>
                  </defs>
                  
                  {/* Línea con gradiente */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={point.x}
                    y2={point.y}
                    stroke={`url(#line-gradient-${group.id})`}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </g>
              );
            })}

            {/* Nodos en cada vértice con efectos */}
            {config.groups.map(group => {
              const progress = calculateGroupProgress(group);
              const radius = calculateRadius(progress);
              const point = getPoint(group.angle, radius);
              const labelRadius = maxRadius + 70; // Más espacio para las etiquetas
              const labelPoint = getPoint(group.angle, labelRadius);
              
              // Función para dividir texto largo en líneas
              const wrapText = (text, maxCharsPerLine = 12) => {
                const words = text.split(' ');
                const lines = [];
                let currentLine = '';
                
                words.forEach(word => {
                  if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
                    currentLine = (currentLine + ' ' + word).trim();
                  } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                  }
                });
                if (currentLine) lines.push(currentLine);
                
                return lines;
              };
              
              const textLines = wrapText(group.name);

              return (
                <g key={group.id}>
                  {/* Glow del nodo */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="18"
                    fill={group.color}
                    opacity="0.2"
                    className="node-glow"
                  />
                  
                  {/* Nodo principal */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="14"
                    fill={group.color}
                    stroke="#fff"
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedGroupId(group.id)}
                    filter={progress === 100 ? "url(#glow)" : ""}
                    className={progress === 100 ? "node-complete" : ""}
                  />
                  
                  {/* Porcentaje */}
                  <text
                    x={point.x}
                    y={point.y + 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {progress}
                  </text>

                  {/* Etiqueta del grupo con soporte multi-línea */}
                  <g style={{ cursor: 'pointer' }} onClick={() => setSelectedGroupId(group.id)}>
                    {textLines.map((line, index) => {
                      const lineHeight = 19; // Aumentado para letras más grandes
                      const totalHeight = textLines.length * lineHeight;
                      const yOffset = (index * lineHeight) - (totalHeight / 2) + (lineHeight / 2);
                      
                      return (
                        <text
                          key={`label-${group.id}-${index}`}
                          x={labelPoint.x}
                          y={labelPoint.y + yOffset}
                          textAnchor="middle"
                          fill={group.color}
                          fontSize="16"
                          fontWeight="700"
                          style={{ pointerEvents: 'none' }}
                        >
                          {line}
                        </text>
                      );
                    })}
                  </g>
                </g>
              );
            })}

            {/* Punto central con animación */}
            <circle 
              cx={centerX} 
              cy={centerY} 
              r="10" 
              fill={isComplete ? "#10b981" : "#6366f1"}
              className="center-pulse"
            />
            <circle 
              cx={centerX} 
              cy={centerY} 
              r="6" 
              fill="#fff"
              opacity="0.8"
            />
          </svg>
        </div>

        <div className="groups-list">
          {config.groups.map(group => {
            const progress = calculateGroupProgress(group);
            const completedTasks = group.tasks.filter(t => t.completed).length;
            
            return (
              <button
                key={group.id}
                className="group-card"
                onClick={() => setSelectedGroupId(group.id)}
                style={{ borderColor: group.color }}
              >
                <div className="group-info">
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    <span className="group-progress" style={{ color: group.color }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="group-tasks-count">
                    {completedTasks} / {group.tasks.length} tareas completadas
                  </div>
                </div>
                <ChevronRight size={24} color={group.color} />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Panel de Tareas de un Grupo (memorizado para evitar re-renders)
  // Panel de Tareas de un Grupo (completamente autónomo)
  const TasksPanel = React.memo(({ groupId, allGroups, toggleTask, updateConfig, onClose, visible }) => {
    // Encontrar el grupo actual
    const group = allGroups.find(g => g.id === groupId);
    
    // Estado local para updates instantáneos (optimistic UI)
    const [localTasks, setLocalTasks] = useState(group ? group.tasks : []);
    const [justToggledTaskId, setJustToggledTaskId] = useState(null);
    const prevGroupIdRef = useRef(groupId);
    
    // Solo sincronizar cuando cambiamos de grupo
    useEffect(() => {
      if (prevGroupIdRef.current !== groupId) {
        const newGroup = allGroups.find(g => g.id === groupId);
        if (newGroup) {
          setLocalTasks(newGroup.tasks);
          prevGroupIdRef.current = groupId;
        }
      }
    }, [groupId, allGroups]);
    
    const progress = useMemo(() => {
      const completedWeight = localTasks
        .filter(task => task.completed)
        .reduce((sum, task) => sum + task.weight, 0);
      return completedWeight;
    }, [localTasks]);
    
    const createConfetti = (buttonElement, wasCompleted) => {
      // Solo crear confetti si se está completando (no al descompletar)
      if (wasCompleted) return;
      
      const rect = buttonElement.getBoundingClientRect();
      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      
      // Crear 8 partículas de confetti
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Ángulos distribuidos en círculo
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 60 + Math.random() * 40;
        particle.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
        particle.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
        
        document.body.appendChild(particle);
        
        // Eliminar después de la animación
        setTimeout(() => particle.remove(), 800);
      }
    };
    
    const handleToggle = useCallback((taskId, event) => {
      const task = localTasks.find(t => t.id === taskId);
      const wasCompleted = task?.completed;
      
      // Marcar esta tarea como la que acaba de ser clicada
      setJustToggledTaskId(taskId);
      
      // Crear confetti si se está completando
      if (!wasCompleted && event?.currentTarget) {
        createConfetti(event.currentTarget, wasCompleted);
      }
      
      // Limpiar la marca después de la animación
      setTimeout(() => setJustToggledTaskId(null), 600);
      
      // Actualizar UI inmediatamente (optimistic)
      setLocalTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
      
      // Llamar a toggleTask que maneja la lógica de celebración épica
      requestAnimationFrame(() => {
        toggleTask(groupId, taskId);
      });
    }, [groupId, toggleTask, localTasks]);
    
    if (!group) return null;
    
    return (
      <div className={`tasks-overlay ${visible ? 'visible' : ''}`}>
        <div className="tasks-panel">
          <div className="tasks-header" style={{ borderColor: group.color }}>
            <button className="btn-back" onClick={onClose}>
              ← Volver
            </button>
            <h2>{group.name}</h2>
            <div className="group-progress-big" style={{ color: group.color }}>
              {progress}%
            </div>
          </div>

          <div className="tasks-list">
            {localTasks.map(task => (
              <button
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''} ${justToggledTaskId === task.id ? 'just-toggled' : ''}`}
                onClick={(e) => handleToggle(task.id, e)}
              >
                <div className="task-checkbox" style={{ borderColor: group.color, color: group.color }}>
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={task.completed ? "#fff" : "none"}
                    stroke={task.completed ? "#fff" : group.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 10v12"/>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                  </svg>
                </div>
                <div className="task-info">
                  <div className="task-name">{task.name}</div>
                  <div className="task-weight">{task.weight}% del grupo</div>
                </div>
              </button>
            ))}
          </div>

          <div className="tasks-summary">
            <div className="summary-item">
              <span>Tareas completadas:</span>
              <strong>{localTasks.filter(t => t.completed).length} / {localTasks.length}</strong>
            </div>
            <div className="summary-item">
              <span>Progreso del grupo:</span>
              <strong style={{ color: group.color }}>{progress}%</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Solo re-renderizar si cambia el groupId o visible
    return prevProps.groupId === nextProps.groupId && prevProps.visible === nextProps.visible;
  });

  // Panel de Configuración
  const ConfigPanel = () => {
    const [tempConfig, setTempConfig] = useState({
      ...JSON.parse(JSON.stringify(config))
    });
    const [invalidGroups, setInvalidGroups] = useState([]);

    const updateGroupName = (groupId, name) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map(g =>
          g.id === groupId ? { ...g, name } : g
        )
      });
    };

    const updateTask = (groupId, taskId, field, value) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map(g => {
          if (g.id === groupId) {
            return {
              ...g,
              tasks: g.tasks.map(t =>
                t.id === taskId ? { ...t, [field]: field === 'name' ? value : Number(value) } : t
              )
            };
          }
          return g;
        })
      });
    };

    const normalizeWeights = (groupId) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map(g => {
          if (g.id === groupId) {
            const total = g.tasks.reduce((sum, t) => sum + t.weight, 0);
            if (total === 0) {
              // Si todos son 0, distribuir equitativamente
              const equalWeight = Math.floor(100 / g.tasks.length);
              const remainder = 100 - (equalWeight * g.tasks.length);
              return {
                ...g,
                tasks: g.tasks.map((t, index) => ({
                  ...t,
                  weight: index === 0 ? equalWeight + remainder : equalWeight
                }))
              };
            } else {
              // Normalizar proporcionalmente
              const normalizedTasks = g.tasks.map(t => ({
                ...t,
                weight: Math.floor((t.weight / total) * 100)
              }));
              
              // Calcular la diferencia y añadirla a la primera tarea
              const sumAfterRounding = normalizedTasks.reduce((sum, t) => sum + t.weight, 0);
              const difference = 100 - sumAfterRounding;
              
              if (difference !== 0) {
                normalizedTasks[0].weight += difference;
              }
              
              return {
                ...g,
                tasks: normalizedTasks
              };
            }
          }
          return g;
        })
      });
    };

    const saveConfig = () => {
      // Validar que todos los grupos sumen 100%
      const invalid = tempConfig.groups.filter(group => {
        const total = group.tasks.reduce((sum, t) => sum + t.weight, 0);
        return total !== 100;
      });

      if (invalid.length > 0) {
        setInvalidGroups(invalid);
        return;
      }

      // Si todo está bien, guardar
      updateConfig(tempConfig);
      setShowConfig(false);
    };

    const resetWeek = () => {
      setShowResetModal(true);
    };

    return (
      <div className="config-panel">
        <div className="config-header">
          <h2>⚙️ Configuración</h2>
          <button className="btn-close" onClick={() => setShowConfig(false)}>✕</button>
        </div>

        <div className="config-content">
          {tempConfig.groups.map(group => {
            const totalWeight = group.tasks.reduce((sum, t) => sum + t.weight, 0);
            const needsNormalization = totalWeight !== 100;

            return (
              <section key={group.id} className="config-section">
                <div className="group-config-header">
                  <input
                    type="text"
                    className="config-group-name"
                    value={group.name}
                    onChange={(e) => updateGroupName(group.id, e.target.value)}
                    placeholder="Nombre del grupo"
                    style={{ borderColor: group.color }}
                  />
                  {needsNormalization && (
                    <button
                      className="btn-normalize"
                      onClick={() => normalizeWeights(group.id)}
                    >
                      Ajustar a 100%
                    </button>
                  )}
                </div>
                
                <div className="weight-total" style={{ 
                  color: needsNormalization ? '#ef4444' : '#10b981' 
                }}>
                  Total: {totalWeight}% {needsNormalization && '⚠️'}
                </div>

                {group.tasks.map((task, index) => (
                  <div key={task.id} className="config-task-row">
                    <span className="task-number">{index + 1}</span>
                    <input
                      type="text"
                      className="config-input-name"
                      value={task.name}
                      onChange={(e) => updateTask(group.id, task.id, 'name', e.target.value)}
                      placeholder="Nombre de la tarea"
                    />
                    <div className="weight-input-group">
                      <input
                        type="number"
                        className="config-input-number"
                        value={task.weight}
                        onChange={(e) => updateTask(group.id, task.id, 'weight', e.target.value)}
                        min="1"
                        max="100"
                      />
                      <span className="weight-label">%</span>
                    </div>
                  </div>
                ))}
              </section>
            );
          })}

          <div className="config-actions">
            <button type="button" className="btn-primary" onClick={saveConfig}>
              <Settings size={18} /> Guardar Cambios
            </button>
            <button type="button" className="btn-danger" onClick={resetWeek}>
              <RotateCcw size={18} /> Resetear Semana
            </button>
          </div>
        </div>

        {/* Modal de Validación */}
        {invalidGroups.length > 0 && (
          <div className="validation-modal-overlay" onClick={() => setInvalidGroups([])}>
            <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="validation-modal-icon">⚠️</div>
              <h2 className="validation-modal-title">Grupos sin ajustar</h2>
              <p className="validation-modal-text">
                Los siguientes grupos no suman 100%:
              </p>
              <div className="validation-groups-list">
                {invalidGroups.map(group => {
                  const total = group.tasks.reduce((sum, t) => sum + t.weight, 0);
                  return (
                    <div key={group.id} className="validation-group-item">
                      <div className="validation-group-header">
                        <strong>{group.name}</strong>
                        <span className="validation-group-total" style={{ color: '#ef4444' }}>
                          {total}%
                        </span>
                      </div>
                      <button 
                        className="btn-normalize-modal"
                        onClick={() => {
                          normalizeWeights(group.id);
                          setInvalidGroups([]);
                        }}
                      >
                        ✓ Ajustar a 100%
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="validation-modal-actions">
                <button 
                  className="validation-modal-btn cancel" 
                  onClick={() => setInvalidGroups([])}
                >
                  Volver a Editar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente de Historial de Semanas
  const HistoryView = () => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'short' });
      return `${day} ${month}`;
    };

    const calculateWeekProgress = (groups) => {
      const totalProgress = groups.reduce((sum, group) => {
        return sum + calculateGroupProgress(group);
      }, 0);
      return (totalProgress / groups.length).toFixed(1);
    };

    if (!config.weekHistory || config.weekHistory.length === 0) {
      return (
        <div className="history-overlay">
          <div className="history-panel">
            <div className="history-header">
              <h2>📅 Historial de Semanas</h2>
              <button className="btn-close" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="history-empty">
              <div className="history-empty-icon">📊</div>
              <p>Aún no hay historial</p>
              <p className="history-empty-text">Completa tu primera semana para ver tu progreso aquí</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="history-overlay">
        <div className="history-panel">
          <div className="history-header">
            <h2>📅 Historial de Semanas</h2>
            <button className="btn-close" onClick={() => setShowHistory(false)}>✕</button>
          </div>

          <div className="history-list">
            {config.weekHistory.map((week, index) => {
              const progress = calculateWeekProgress(week.groups);
              const completedTasks = week.groups.reduce((sum, group) => {
                return sum + group.tasks.filter(t => t.completed).length;
              }, 0);
              const totalTasks = week.groups.reduce((sum, group) => {
                return sum + group.tasks.length;
              }, 0);

              return (
                <div 
                  key={index} 
                  className="history-week-card"
                  onClick={() => setSelectedWeekHistory(week)}
                >
                  <div className="history-week-header">
                    <div className="history-week-dates">
                      <span className="history-week-range">
                        {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                      </span>
                      <span className="history-week-ago">
                        Hace {index === 0 ? 'una' : index + 1} semana{index !== 0 ? 's' : ''}
                      </span>
                    </div>
                    <div className="history-week-progress">{progress}%</div>
                  </div>

                  <div className="history-week-stats">
                    <div className="history-stat">
                      <span className="history-stat-value">{completedTasks}/{totalTasks}</span>
                      <span className="history-stat-label">Tareas</span>
                    </div>
                    <div className="history-hexagon-mini">
                      <svg viewBox="0 0 100 100" width="60" height="60">
                        {/* Hexágono de referencia */}
                        <path
                          d={createMiniHexPath(week.groups, 40, () => 40)}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="1"
                        />
                        {/* Hexágono de progreso */}
                        <path
                          d={createMiniHexPath(week.groups, 40, (group) => {
                            const groupProgress = calculateGroupProgress(group);
                            return 5 + (35 * groupProgress / 100);
                          })}
                          fill="rgba(99, 102, 241, 0.3)"
                          stroke="#6366f1"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de detalle de semana */}
        {selectedWeekHistory && (
          <WeekDetailModal 
            week={selectedWeekHistory} 
            onClose={() => setSelectedWeekHistory(null)}
          />
        )}
      </div>
    );
  };

  // Función auxiliar para crear mini hexágonos
  const createMiniHexPath = (groups, maxRadius, radiusFunc) => {
    const centerX = 50;
    const centerY = 50;

    const getPoint = (angle, radius) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(radians - Math.PI / 2),
        y: centerY + radius * Math.sin(radians - Math.PI / 2)
      };
    };

    const points = groups.map(group => {
      const radius = radiusFunc(group);
      return getPoint(group.angle, radius);
    });

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  // Modal de detalle de semana pasada
  const WeekDetailModal = ({ week, onClose }) => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
    };

    const progress = week.groups.reduce((sum, group) => {
      return sum + calculateGroupProgress(group);
    }, 0) / week.groups.length;

    return (
      <div className="week-detail-overlay" onClick={onClose}>
        <div className="week-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="week-detail-header">
            <button className="btn-back" onClick={onClose}>← Volver</button>
            <div className="week-detail-dates">
              <div className="week-detail-title">Semana del</div>
              <div className="week-detail-range">
                {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
              </div>
            </div>
            <div className="week-detail-progress">{progress.toFixed(1)}%</div>
          </div>

          {/* Hexágono grande */}
          <svg className="week-detail-hexagon" viewBox="0 0 500 500">
            {/* Hexágono de referencia (100%) */}
            <path
              d={createDetailHexPath(week.groups, () => 160)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Hexágono de progreso */}
            <path
              d={createDetailHexPath(week.groups, (group) => {
                const groupProgress = calculateGroupProgress(group);
                return 20 + (140 * groupProgress / 100);
              })}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="#6366f1"
              strokeWidth="2"
            />

            {/* Líneas y nodos */}
            {week.groups.map(group => {
              const groupProgress = calculateGroupProgress(group);
              const radius = 20 + (140 * groupProgress / 100);
              const point = getDetailPoint(group.angle, radius);
              const labelRadius = 210;
              const labelPoint = getDetailPoint(group.angle, labelRadius);
              
              return (
                <g key={group.id}>
                  {/* Línea */}
                  <line
                    x1="250"
                    y1="250"
                    x2={point.x}
                    y2={point.y}
                    stroke={group.color}
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  
                  {/* Nodo */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="10"
                    fill={group.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  
                  {/* Porcentaje */}
                  <text
                    x={point.x}
                    y={point.y + 4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {groupProgress}
                  </text>

                  {/* Etiqueta */}
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {group.name}
                  </text>
                </g>
              );
            })}

            {/* Centro */}
            <circle cx="250" cy="250" r="6" fill="#6366f1" />
          </svg>

          {/* Lista de grupos con tareas */}
          <div className="week-detail-groups">
            {week.groups.map(group => (
              <div key={group.id} className="week-detail-group">
                <div className="week-detail-group-header" style={{ borderColor: group.color }}>
                  <h3 style={{ color: group.color }}>{group.name}</h3>
                  <span className="week-detail-group-progress">
                    {calculateGroupProgress(group)}%
                  </span>
                </div>
                <div className="week-detail-tasks">
                  {group.tasks.map(task => (
                    <div key={task.id} className="week-detail-task">
                      <span className="week-detail-task-icon">
                        {task.completed ? '✓' : '○'}
                      </span>
                      <span className={`week-detail-task-name ${task.completed ? 'completed' : ''}`}>
                        {task.name}
                      </span>
                      <span className="week-detail-task-weight">{task.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const createDetailHexPath = (groups, radiusFunc) => {
    const centerX = 250;
    const centerY = 250;

    const points = groups.map(group => {
      const radius = radiusFunc(group);
      return getDetailPoint(group.angle, radius);
    });

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  const getDetailPoint = (angle, radius) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: 250 + radius * Math.cos(radians - Math.PI / 2),
      y: 250 + radius * Math.sin(radians - Math.PI / 2)
    };
  };

  // Modal de Celebración Épica
  const CelebrationModal = () => {
    const [confettiPieces, setConfettiPieces] = useState([]);
    
    useEffect(() => {
      // Crear confeti masivo
      const pieces = [];
      for (let i = 0; i < 80; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
        });
      }
      setConfettiPieces(pieces);
    }, []);
    
    const handleClose = () => {
      setShowCelebration(false);
      setShowEpicAnimation(false);
      setEpicAnimationTriggered(true); // Marcar como ya ocurrida
    };
    
    return (
      <div className="celebration-overlay" onClick={handleClose}>
        <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
          {/* Confeti */}
          {confettiPieces.map(piece => (
            <div
              key={piece.id}
              className="confetti-fall"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                backgroundColor: piece.color
              }}
            />
          ))}
          
          {/* Contenido */}
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
            <h1 className="celebration-title">¡INCREÍBLE!</h1>
            <p className="celebration-subtitle">Has completado todos tus objetivos</p>
            <div className="celebration-stats">
              <div className="celebration-stat">
                <div className="celebration-stat-number">100%</div>
                <div className="celebration-stat-label">Completado</div>
              </div>
              <div className="celebration-stat">
                <div className="celebration-stat-number">{config.groups.length}</div>
                <div className="celebration-stat-label">Áreas</div>
              </div>
              <div className="celebration-stat">
                <div className="celebration-stat-number">
                  {config.groups.reduce((sum, g) => sum + g.tasks.length, 0)}
                </div>
                <div className="celebration-stat-label">Tareas</div>
              </div>
            </div>
            <p className="celebration-message">
              ¡Excelente trabajo esta semana! Has demostrado disciplina y 
              dedicación en todas las áreas de tu vida. Sigue así 💪
            </p>
            <button className="celebration-button" onClick={handleClose}>
              ✨ Continuar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de Confirmación de Reset
  const ResetConfirmModal = () => {
    const confirmReset = () => {
      // Limpiar flag de celebración de la semana actual
      const celebrationKey = `celebration-shown-${config.weekStart}`;
      localStorage.removeItem(celebrationKey);
      
      // Resetear estados de celebración
      setEpicAnimationTriggered(false);
      setShowEpicAnimation(false);
      setCelebrationShown(false);
      
      // Guardar semana actual en historial
      const weekStart = new Date(config.weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekRecord = {
        weekStart: config.weekStart,
        weekEnd: weekEnd.toISOString().split('T')[0],
        groups: JSON.parse(JSON.stringify(config.groups))
      };
      
      const updatedHistory = [weekRecord, ...(config.weekHistory || [])].slice(0, 52);
      
      const resetData = {
        ...config,
        groups: config.groups.map(group => ({
          ...group,
          tasks: group.tasks.map(task => ({
            ...task,
            completed: false
          }))
        })),
        weekStart: new Date().toISOString().split('T')[0],
        weekHistory: updatedHistory
      };
      updateConfig(resetData);
      setShowConfig(false);
      setShowResetModal(false);
    };

    const cancelReset = () => {
      setShowResetModal(false);
    };

    return (
      <div className="reset-modal-overlay">
        <div className="reset-modal">
          <div className="reset-modal-icon">🔄</div>
          <h2 className="reset-modal-title">¿Resetear Semana?</h2>
          <p className="reset-modal-text">
            Esta acción desmarcará todas las tareas completadas.
          </p>
          <ul className="reset-modal-list">
            <li>✅ Se mantendrán tus grupos y tareas personalizadas</li>
            <li>✕ Se desmarcarán todas las tareas completadas</li>
            <li>📅 Se iniciará una nueva semana</li>
          </ul>
          <div className="reset-modal-actions">
            <button 
              type="button"
              className="reset-modal-btn cancel" 
              onClick={cancelReset}
            >
              ✕ Cancelar
            </button>
            <button 
              type="button"
              className="reset-modal-btn confirm" 
              onClick={confirmReset}
            >
              ✅ Sí, Resetear
            </button>
          </div>
        </div>
      </div>
    );
  };
  // ⭐ NUEVO: Componente de Tienda
  const ShopPanel = () => {
    const buyItem = (item) => {
      if (config.coins < item.price) {
        alert('¡No tienes suficientes monedas!');
        return;
      }
      
      // Aplicar efecto del item
      let updates = {
        coins: config.coins - item.price,
        purchasedItems: [...(config.purchasedItems || []), item]
      };
      
      if (item.type === 'heal') {
        updates.health = Math.min(config.maxHealth, config.health + 20);
        alert('❤️ ¡Recuperaste 20 puntos de vida!');
      } else if (item.type === 'skip_task') {
        alert('⏭️ ¡Puedes saltar una tarea! Usa este item sabiamente.');
      } else if (item.type === 'complete_group') {
        alert('🎁 ¡Tienes un día libre! Completa un grupo automáticamente desde Config.');
      }
      
      updateConfig(updates);
    };
    
    return (
      <div className="shop-overlay" onClick={() => setShowShop(false)}>
        <div className="shop-panel" onClick={(e) => e.stopPropagation()}>
          <div className="shop-header">
            <h2>🛒 Tienda</h2>
            <div className="player-coins">
              <Coins size={20} color="#f59e0b" fill="#f59e0b" />
              <span>{config.coins}</span>
            </div>
            <button className="btn-close" onClick={() => setShowShop(false)}>✕</button>
          </div>
          
          <div className="shop-content">
            {config.shopItems.map(item => (
              <div key={item.id} className="shop-item">
                <div className="item-icon">{item.icon}</div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="item-purchase">
                  <div className="item-price">
                    <Coins size={16} color="#f59e0b" fill="#f59e0b" />
                    <span>{item.price}</span>
                  </div>
                  <button 
                    className="btn-buy"
                    onClick={() => buyItem(item)}
                    disabled={config.coins < item.price}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ⭐ NUEVO: Pantalla de Muerte
  const DeathScreen = () => {
    const handleRevive = () => {
      if (confirm(`¿Has completado el castigo: "${config.deathPenalty}"?`)) {
        updateConfig({
          health: 25,
          isDead: false
        });
        setShowDeathScreen(false);
      }
    };
    
    return (
      <div className="death-overlay">
        <div className="death-panel">
          <div className="death-skull">💀</div>
          <h1 className="death-title">HAS MUERTO</h1>
          <p className="death-subtitle">No completaste tus objetivos...</p>
          
          <div className="death-penalty-box">
            <h3>Castigo para Revivir:</h3>
            <p className="penalty-text">{config.deathPenalty}</p>
          </div>
          
          <button className="btn-revive" onClick={handleRevive}>
            ✓ He Completado el Castigo
          </button>
          
          <p className="revive-note">Revivirás con 25 HP</p>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">HABIT HERO</div>
        <div className="player-stats">
          <div className="stat-item health-stat">
            <Heart size={18} color="#ef4444" fill={config.health > 25 ? "#ef4444" : "none"} />
            <span className="stat-value">{config.health}/{config.maxHealth}</span>
          </div>
          <div className="stat-item coins-stat">
            <Coins size={18} color="#f59e0b" fill="#f59e0b" />
            <span className="stat-value">{config.coins}</span>
          </div>
        </div>
        <div className="header-actions">
          {/* ⭐ NUEVO: Botón de tienda */}
          <button className="btn-shop" onClick={() => setShowShop(true)}>
            <ShoppingBag size={18} />
            <span className="btn-text">Tienda</span>
          </button>
          <button 
            className="btn-history" 
            onClick={() => setShowHistory(true)}
            data-tooltip="Ver historial semanal"
          >
            <Calendar size={18} />
            <span className="btn-text">Historial</span>
          </button>
          <button 
            className="btn-settings" 
            onClick={() => setShowConfig(true)}
            data-tooltip="Configurar grupos y tareas"
          >
            <Settings size={18} />
            <span className="btn-text">Config</span>
          </button>
        </div>
      </div>

      <HexagonView />

      <TasksPanel 
        groupId={selectedGroupId || 1}
        allGroups={config.groups}
        toggleTask={toggleTask}
        updateConfig={updateConfig}
        onClose={handleCloseTasksPanel}
        visible={selectedGroupId !== null}
      />
      
      {showConfig && <ConfigPanel />}
      
      {showHistory && <HistoryView />}
      
      {showResetModal && <ResetConfirmModal />}
      
      {showCelebration && <CelebrationModal />}

      {showShop && <ShopPanel />}

      {showDeathScreen && <DeathScreen />}
    </div>
  );
}

export default HabitHeroWeekly;
