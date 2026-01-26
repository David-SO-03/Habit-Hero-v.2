import "./App.css";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Settings,
  RotateCcw,
  ChevronRight,
  Calendar,
  ShoppingBag,
  Heart,
  Coins,
} from "lucide-react";

// Configuración por defecto
const DEFAULT_CONFIG = {
  groups: [
    {
      id: 1,
      name: "Cliente y Negocio",
      angle: 0,
      color: "#ef4444",
      tasks: [
        {
          id: 1,
          name: "¿He contactado con algún cliente esta semana?",
          weight: 40,
          completed: false,
        },
        {
          id: 2,
          name: "¿He tomado decisiones para mejorar el margen?",
          weight: 30,
          completed: false,
        },
        {
          id: 3,
          name: "¿He propuesto una mejora al cliente o contrato?",
          weight: 30,
          completed: false,
        },
      ],
    },
    {
      id: 2,
      name: "Excelencia Operativa",
      angle: 60,
      color: "#f59e0b",
      tasks: [
        {
          id: 4,
          name: "¿He trabajado con oficio y detalle?",
          weight: 50,
          completed: false,
        },
        {
          id: 5,
          name: "¿He aplicado o compartido una buena práctica?",
          weight: 25,
          completed: false,
        },
        {
          id: 6,
          name: "¿He evitado o corregido un error recurrente?",
          weight: 25,
          completed: false,
        },
      ],
    },
    {
      id: 3,
      name: "Organización, Talento y Cultura",
      angle: 120,
      color: "#10b981",
      tasks: [
        {
          id: 7,
          name: "¿He ayudado al equipo a trabajar mejor?",
          weight: 40,
          completed: false,
        },
        {
          id: 8,
          name: "¿He cuidado el buen clima del equipo?",
          weight: 30,
          completed: false,
        },
        {
          id: 9,
          name: "¿He dado o pedido feedback constructivo?",
          weight: 30,
          completed: false,
        },
      ],
    },
    {
      id: 4,
      name: "Liderazgo y Coherencia",
      angle: 180,
      color: "#3b82f6",
      tasks: [
        {
          id: 10,
          name: "¿He liderado con el ejemplo?",
          weight: 40,
          completed: false,
        },
        {
          id: 11,
          name: "¿He sido claro y coherente al comunicar?",
          weight: 35,
          completed: false,
        },
        {
          id: 12,
          name: "¿He generado confianza con mis acciones?",
          weight: 25,
          completed: false,
        },
      ],
    },
    {
      id: 5,
      name: "Innovación, IA y Tecnología",
      angle: 240,
      color: "#8b5cf6",
      tasks: [
        {
          id: 13,
          name: "¿He usado tecnología para ser más eficiente?",
          weight: 40,
          completed: false,
        },
        {
          id: 14,
          name: "¿He simplificado o automatizado tareas?",
          weight: 30,
          completed: false,
        },
        {
          id: 15,
          name: "¿He probado o propuesto una mejora digital?",
          weight: 30,
          completed: false,
        },
      ],
    },
    {
      id: 6,
      name: "Energía Personal",
      angle: 300,
      color: "#ec4899",
      tasks: [
        {
          id: 16,
          name: "¿He cuidado mi energía física?",
          weight: 35,
          completed: false,
        },
        {
          id: 17,
          name: "¿He dedicado tiempo a mi entorno personal?",
          weight: 40,
          completed: false,
        },
        {
          id: 18,
          name: "¿He afrontado la semana con actitud positiva?",
          weight: 25,
          completed: false,
        },
      ],
    },
  ],
  weekStart: new Date().toISOString().split("T")[0],
  weekHistory: [],

  // ⭐ NUEVO: Sistema de economía
  coins: 0,
  coinsPerGroup: 10,
  totalCoinsEarned: 0,
  weekCoinsEarned: 0,

  // ⭐ NUEVO: Sistema de vida
  health: 100,
  maxHealth: 100,
  healthLossPerIncompleteGroup: 15,
  isDead: false,
  deathPenalty: "Hacer 50 flexiones",
  weeklyHealthRegenUsed: [],

  // ⭐ NUEVO: Tienda
  shopItems: [
    {
      id: 1,
      name: "Saltar una tarea",
      description: "Puedes saltar una tarea esta semana",
      price: 30,
      type: "skip_task",
      icon: "⭐",
    },
    {
      id: 2,
      name: "Día libre",
      description: "Completa automáticamente un grupo",
      price: 120,
      type: "complete_group",
      icon: "🎁",
    },
    {
      id: 3,
      name: "Poción de vida",
      description: "Recupera 5 puntos de vida",
      price: 30,
      type: "heal",
      icon: "❤️",
      healAmount: 5,
    },
    {
      id: 4,
      name: "El jefe invita",
      description: "Café o desayuno pagado por tu responsable directo",
      price: 90,
      type: "personalizado",
      icon: "😄",
    },
    {
      id: 5,
      name: "Silencio administrativo",
      description:
        "No responder a un email interno durante 24 h (si no es urgente)",
      price: 60,
      type: "personalizado",
      icon: "🤫",
    },
  ],
  purchasedItems: [],
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
  const [showShopConfig, setShowShopConfig] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [pendingNewWeekNotification, setPendingNewWeekNotification] =
    useState(false);

  const hexagonRef = useRef(null);

  // Función para mostrar banners de notificación in-app
  const showInAppBanner = (title, message) => {
    const banner = document.createElement("div");
    banner.className = "notification-banner";
    banner.innerHTML = `
      <div class="notification-banner-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);

    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 5000);
  };

  useEffect(() => {
    loadGameData();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (config.weekStart) {
      checkAndSendNotifications();
    }
  }, [config.weekStart, config.groups]);

  useEffect(() => {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "none";
  }, []);

  // Mostrar notificación de nueva semana cuando se activa el flag
  useEffect(() => {
    if (pendingNewWeekNotification) {
      const timer = setTimeout(() => {
        showInAppBanner(
          "🎯 ¡Ha empezado una nueva semana!",
          "Empieza fuerte y alcanza tus metas. ¡Vamos! 🚀"
        );
        setPendingNewWeekNotification(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingNewWeekNotification]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log("Error al pedir permisos de notificación:", error);
      }
    }
  };

  const checkAndSendNotifications = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const daysLeft = getDaysLeftInWeek();
    const isComplete = isWeekComplete();

    if (daysLeft === 1 && !isComplete) {
      const notifKey = `notif-last-day-${config.weekStart}`;
      const alreadySent = localStorage.getItem(notifKey);

      if (!alreadySent) {
        sendNotification(
          "⏰ ¡Último día de la semana!",
          "Todavía puedes completar tus objetivos. ¡Tú puedes! 💪",
          "⏰"
        );
        localStorage.setItem(notifKey, "true");
      }
    }
    // Nota: La notificación de "nueva semana" se maneja directamente en loadGameData
    // cuando se hace el auto-reset, para evitar falsos positivos por timezone
  };

  const sendNotification = (title, body, icon) => {
    if (document.hidden) {
      new Notification(title, {
        body: body,
        icon: icon,
        badge: icon,
        vibrate: [200, 100, 200],
        tag: "habit-hero-notification",
        requireInteraction: false,
      });
    } else {
      showInAppBanner(title, body);
    }
  };

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
        const result = await window.storage.get("habit-hero-weekly");
        if (result && result.value) {
          const savedData = JSON.parse(result.value);

          const savedWeekStart = new Date(savedData.weekStart);
          const today = new Date();
          const daysSinceStart = Math.floor(
            (today - savedWeekStart) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceStart >= 7) {
            const weekEnd = new Date(savedWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const incompleteGroups = savedData.groups.filter(
              (g) => calculateGroupProgress(g) < 100
            );
            const healthLoss =
              incompleteGroups.length *
              (savedData.healthLossPerIncompleteGroup || 15);
            const newHealth = Math.max(
              0,
              (savedData.health || 100) - healthLoss
            );

            const weekRecord = {
              weekStart: savedData.weekStart,
              weekEnd: weekEnd.toISOString().split("T")[0],
              groups: JSON.parse(JSON.stringify(savedData.groups)),
              coinsEarned: savedData.weekCoinsEarned || 0,
              healthLost: healthLoss,
            };

            const updatedHistory = [
              weekRecord,
              ...(savedData.weekHistory || []),
            ].slice(0, 52);

            const resetData = {
              ...savedData,
              groups: savedData.groups.map((group) => ({
                ...group,
                tasks: group.tasks.map((task) => ({
                  ...task,
                  completed: false,
                })),
              })),
              weekStart: today.toISOString().split("T")[0],
              weekHistory: updatedHistory,
              health: newHealth,
              isDead: newHealth === 0,
              weeklyHealthRegenUsed: [],
              purchasedItems: [],
              weekCoinsEarned: 0,
            };

            const oldCelebrationKey = `celebration-shown-${savedData.weekStart}`;
            localStorage.removeItem(oldCelebrationKey);

            // Notificación de nueva semana (se dispara aquí, en el momento del reset)
            const newWeekNotifKey = `notif-new-week-${resetData.weekStart}`;
            if (!localStorage.getItem(newWeekNotifKey)) {
              localStorage.setItem(newWeekNotifKey, "true");
              setPendingNewWeekNotification(true);
            }

            setConfig(resetData);
            await saveGameData(resetData);
          } else {
            const dataWithHistory = {
              ...savedData,
              weekHistory: savedData.weekHistory || [],
            };
            setConfig(dataWithHistory);
          }
        }
      } else if (localStorage) {
        const savedData = localStorage.getItem("habit-hero-weekly");
        if (savedData) {
          const parsed = JSON.parse(savedData);

          const savedWeekStart = new Date(parsed.weekStart);
          const today = new Date();
          const daysSinceStart = Math.floor(
            (today - savedWeekStart) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceStart >= 7) {
            const weekEnd = new Date(savedWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            // Función helper para calcular progreso del grupo
            const calcGroupProgress = (group) => {
              return group.tasks
                .filter((task) => task.completed)
                .reduce((sum, task) => sum + task.weight, 0);
            };

            // Calcular pérdida de vida por grupos incompletos
            const incompleteGroups = parsed.groups.filter(
              (g) => calcGroupProgress(g) < 100
            );
            const healthLoss =
              incompleteGroups.length *
              (parsed.healthLossPerIncompleteGroup || 15);
            const newHealth = Math.max(0, (parsed.health || 100) - healthLoss);

            const weekRecord = {
              weekStart: parsed.weekStart,
              weekEnd: weekEnd.toISOString().split("T")[0],
              groups: JSON.parse(JSON.stringify(parsed.groups)),
              coinsEarned: parsed.weekCoinsEarned || 0,
              healthLost: healthLoss,
            };

            const updatedHistory = [
              weekRecord,
              ...(parsed.weekHistory || []),
            ].slice(0, 52);

            const resetData = {
              ...parsed,
              groups: parsed.groups.map((group) => ({
                ...group,
                tasks: group.tasks.map((task) => ({
                  ...task,
                  completed: false,
                })),
              })),
              weekStart: today.toISOString().split("T")[0],
              weekHistory: updatedHistory,
              health: newHealth,
              isDead: newHealth === 0,
              weeklyHealthRegenUsed: [],
              purchasedItems: [],
              weekCoinsEarned: 0,
            };

            const oldCelebrationKey = `celebration-shown-${parsed.weekStart}`;
            localStorage.removeItem(oldCelebrationKey);

            // Notificación de nueva semana (se dispara aquí, en el momento del reset)
            const newWeekNotifKey = `notif-new-week-${resetData.weekStart}`;
            if (!localStorage.getItem(newWeekNotifKey)) {
              localStorage.setItem(newWeekNotifKey, "true");
              setPendingNewWeekNotification(true);
            }

            setConfig(resetData);
            localStorage.setItem(
              "habit-hero-weekly",
              JSON.stringify(resetData)
            );
          } else {
            const dataWithHistory = {
              ...parsed,
              weekHistory: parsed.weekHistory || [],
            };
            setConfig(dataWithHistory);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveGameData = async (data) => {
    try {
      if (window.storage) {
        await window.storage.set("habit-hero-weekly", JSON.stringify(data));
      } else if (localStorage) {
        localStorage.setItem("habit-hero-weekly", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const updateConfig = (updates) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveGameData(newConfig);
  };

  const triggerEpicCelebration = useCallback(() => {
    const celebrationKey = `celebration-shown-${config.weekStart}`;
    const alreadyShown = localStorage.getItem(celebrationKey);

    if (alreadyShown) {
      return;
    }

    if (showCelebration) {
      return;
    }

    localStorage.setItem(celebrationKey, "true");

    setShowEpicAnimation(true);

    setSelectedGroupId(null);

    setTimeout(() => {
      if (hexagonRef.current) {
        hexagonRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    setTimeout(() => {
      setShowEpicAnimation(false);
    }, 1800);

    setTimeout(() => {
      setShowCelebration(true);
      setCelebrationShown(true);
    }, 2100);
  }, [config.weekStart, showCelebration]);

  const toggleTask = useCallback(
    (groupId, taskId) => {
      const celebrationKey = `celebration-shown-${config.weekStart}`;
      const alreadyShown = localStorage.getItem(celebrationKey);
      const group = config.groups.find((g) => g.id === groupId);
      const task = group.tasks.find((t) => t.id === taskId);
      const wasGroupComplete = calculateGroupProgress(group) === 100;

      const wasComplete = isWeekComplete();

      const updatedGroups = config.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            tasks: group.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          };
        }
        return group;
      });

      let updates = { groups: updatedGroups };
      const updatedGroup = updatedGroups.find((g) => g.id === groupId);
      const isGroupCompleteNow = calculateGroupProgress(updatedGroup) === 100;

      if (!wasGroupComplete && isGroupCompleteNow) {
        const coinsEarned = config.coinsPerGroup || 10;
        updates.coins = (config.coins || 0) + coinsEarned;
        updates.totalCoinsEarned = (config.totalCoinsEarned || 0) + coinsEarned;
        updates.weekCoinsEarned = (config.weekCoinsEarned || 0) + coinsEarned;

        const healthRegenUsed = config.weeklyHealthRegenUsed || [];
        if (
          !healthRegenUsed.includes(groupId) &&
          config.health < config.maxHealth
        ) {
          const healthGain = 2;
          updates.health = Math.min(
            config.maxHealth,
            (config.health || 100) + healthGain
          );
          updates.weeklyHealthRegenUsed = [...healthRegenUsed, groupId];

          showRewardNotification(coinsEarned, healthGain);
        } else {
          showRewardNotification(coinsEarned, 0);
        }
      }

      if (wasGroupComplete && !isGroupCompleteNow) {
        const coinsToRemove = config.coinsPerGroup || 10;
        updates.coins = (config.coins || 0) - coinsToRemove;
        updates.totalCoinsEarned =
          (config.totalCoinsEarned || 0) - coinsToRemove;
        updates.weekCoinsEarned = (config.weekCoinsEarned || 0) - coinsToRemove;
        updates.weeklyHealthRegenUsed = (
          config.weeklyHealthRegenUsed || []
        ).filter((id) => id !== groupId);
      }

      const willBeComplete = updatedGroups.every((group) => {
        const completedWeight = group.tasks
          .filter((task) => task.completed)
          .reduce((sum, task) => sum + task.weight, 0);
        return completedWeight === 100;
      });

      if (
        !wasComplete &&
        willBeComplete &&
        !epicAnimationTriggered &&
        !alreadyShown
      ) {
        setEpicAnimationTriggered(true);
        triggerEpicCelebration();
      }

      updateConfig(updates);
    },
    [config, epicAnimationTriggered, triggerEpicCelebration, updateConfig]
  );

  const calculateGroupProgress = (group) => {
    const completedWeight = group.tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);
    return completedWeight;
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
    return config.groups.every((group) => {
      const progress = calculateGroupProgress(group);
      return progress === 100;
    });
  };

  const handleCloseTasksPanel = useCallback(() => {
    setSelectedGroupId(null);
  }, []);

  const showRewardNotification = (coins, health) => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>¡Grupo Completado!</strong>
        <div class="rewards">
          <span class="reward-item">+${coins} 🪙</span>
          ${health > 0 ? `<span class="reward-item">+${health} ❤️</span>` : ""}
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const showNoCoinsNotification = () => {
    const banner = document.createElement("div");
    banner.className = "error-notification";

    banner.innerHTML = `
      <div class="error-content">
        <strong>❌ ¡No tienes suficientes monedas!</strong>
      </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 50);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 2500);
  };

  const showItemNotification = () => {
    const banner = document.createElement("div");
    banner.className = "error-notification";

    banner.innerHTML = `
      <div class="error-content">
        <strong>❌ Debe haber al menos un item en la tienda</strong>
      </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 50);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 2500);
  };

  const showShopConfifNotification = () => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>✅ Configuración de la tienda guardada</strong>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const showHealthNotification = (health) => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>❤️ ¡Recuperaste ${health} puntos de vida!</strong>
        <div class="rewards">
          ${health > 0 ? `<span class="reward-item">+${health} ❤️</span>` : ""}
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const showSkipSmallNotification = () => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>⭐ ¡Puedes saltar una tarea! Usa este item sabiamente.</strong>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const showSkipBigNotification = () => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>🎁 ¡Tienes un día libre! Completa un grupo de objetivos entero.</strong>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const showDefaultNotification = () => {
    const banner = document.createElement("div");
    banner.className = "reward-notification";
    banner.innerHTML = `
      <div class="reward-content">
        <strong>🥳 Has comprado este item. ¡Disfrutalo! 🥳</strong>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add("show"), 100);
    setTimeout(() => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  };

  const HexagonView = () => {
    const centerX = 250;
    const centerY = 250;
    const baseRadius = 20;
    const maxRadius = 160;

    const calculateRadius = (percentage) => {
      return baseRadius + (maxRadius - baseRadius) * (percentage / 100);
    };

    const getPoint = (angle, radius) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(radians - Math.PI / 2),
        y: centerY + radius * Math.sin(radians - Math.PI / 2),
      };
    };

    const createHexagonPath = (radiusFunc) => {
      const points = config.groups.map((group) => {
        const radius = radiusFunc(group);
        return getPoint(group.angle, radius);
      });
      return (
        points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
        " Z"
      );
    };

    const overallProgress = calculateOverallProgress();
    const isComplete = config.groups.every(
      (group) => calculateGroupProgress(group) === 100
    );

    return (
      <div className="screen-content">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">📊 Progreso Semanal</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${overallProgress}%` }}
              ></div>
              <span className="progress-text">{overallProgress}%</span>
            </div>
          </div>
          <div className="stat">
            <span className="stat-label">⏰ Días Restantes</span>
            <div className="days-week-container">
              <div className="week-dots">
                {[...Array(7)].map((_, index) => {
                  const dayPassed = index < 7 - getDaysLeftInWeek();

                  return (
                    <div
                      key={index}
                      className={`week-dot ${
                        dayPassed ? "passed" : "remaining"
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {dayPassed && <div className="week-dot-glow"></div>}
                    </div>
                  );
                })}
              </div>

              <div className="days-number-display">
                <span className="days-big-number">{getDaysLeftInWeek()}</span>
                <span className="days-text">
                  día{getDaysLeftInWeek() !== 1 ? "s" : ""} restante
                  {getDaysLeftInWeek() !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={hexagonRef}
          className={`hexagon-container ${showEpicAnimation ? "complete" : ""}`}
        >
          <svg className="hexagon-svg" viewBox="0 0 500 500">
            <defs>
              <radialGradient id="hexGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
              </radialGradient>

              <filter
                id="hexShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                <feOffset dx="0" dy="4" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="250"
              cy="250"
              r="160"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            <circle
              cx="250"
              cy="250"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            <circle
              cx="250"
              cy="250"
              r="80"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
            <circle
              cx="250"
              cy="250"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />

            <path
              d={createHexagonPath(() => maxRadius)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            <path
              className="hex-progress"
              d={createHexagonPath((group) =>
                calculateRadius(calculateGroupProgress(group))
              )}
              fill="url(#hexGradient)"
              stroke={isComplete ? "#10b981" : "#6366f1"}
              strokeWidth="3"
              filter="url(#hexShadow)"
            />

            {config.groups.map((group) => {
              const progress = calculateGroupProgress(group);
              const radius = calculateRadius(progress);
              const point = getPoint(group.angle, radius);

              return (
                <g key={`line-group-${group.id}`}>
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

            {config.groups.map((group) => {
              const progress = calculateGroupProgress(group);
              const radius = calculateRadius(progress);
              const point = getPoint(group.angle, radius);
              const labelRadius = maxRadius + 70;
              const labelPoint = getPoint(group.angle, labelRadius);

              const wrapText = (text, maxCharsPerLine = 12) => {
                const words = text.split(" ");
                const lines = [];
                let currentLine = "";

                words.forEach((word) => {
                  if (
                    (currentLine + " " + word).trim().length <= maxCharsPerLine
                  ) {
                    currentLine = (currentLine + " " + word).trim();
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
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="18"
                    fill={group.color}
                    opacity="0.2"
                    className="node-glow"
                  />

                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="14"
                    fill={group.color}
                    stroke="#fff"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedGroupId(group.id)}
                    filter={progress === 100 ? "url(#glow)" : ""}
                    className={progress === 100 ? "node-complete" : ""}
                  />

                  <text
                    x={point.x}
                    y={point.y + 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="700"
                    style={{ pointerEvents: "none" }}
                  >
                    {progress}
                  </text>

                  <g
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    {textLines.map((line, index) => {
                      const lineHeight = 19;
                      const totalHeight = textLines.length * lineHeight;
                      const yOffset =
                        index * lineHeight - totalHeight / 2 + lineHeight / 2;

                      return (
                        <text
                          key={`label-${group.id}-${index}`}
                          x={labelPoint.x}
                          y={labelPoint.y + yOffset}
                          textAnchor="middle"
                          fill={group.color}
                          fontSize="16"
                          fontWeight="700"
                          style={{ pointerEvents: "none" }}
                        >
                          {line}
                        </text>
                      );
                    })}
                  </g>
                </g>
              );
            })}

            <circle
              cx={centerX}
              cy={centerY}
              r="10"
              fill={isComplete ? "#10b981" : "#6366f1"}
              className="center-pulse"
            />
            <circle cx={centerX} cy={centerY} r="6" fill="#fff" opacity="0.8" />
          </svg>
        </div>

        <div className="groups-list">
          {config.groups.map((group) => {
            const progress = calculateGroupProgress(group);
            const completedTasks = group.tasks.filter(
              (t) => t.completed
            ).length;

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
                    <span
                      className="group-progress"
                      style={{ color: group.color }}
                    >
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

  const TasksPanel = React.memo(
    ({ groupId, allGroups, toggleTask, updateConfig, onClose, visible }) => {
      const group = allGroups.find((g) => g.id === groupId);

      const [localTasks, setLocalTasks] = useState(group ? group.tasks : []);
      const [justToggledTaskId, setJustToggledTaskId] = useState(null);
      const prevGroupIdRef = useRef(groupId);

      useEffect(() => {
        if (prevGroupIdRef.current !== groupId) {
          const newGroup = allGroups.find((g) => g.id === groupId);
          if (newGroup) {
            setLocalTasks(newGroup.tasks);
            prevGroupIdRef.current = groupId;
          }
        }
      }, [groupId, allGroups]);

      const progress = useMemo(() => {
        const completedWeight = localTasks
          .filter((task) => task.completed)
          .reduce((sum, task) => sum + task.weight, 0);
        return completedWeight;
      }, [localTasks]);

      const createConfetti = (buttonElement, wasCompleted) => {
        if (wasCompleted) return;

        const rect = buttonElement.getBoundingClientRect();
        const colors = [
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
        ];

        for (let i = 0; i < 8; i++) {
          const particle = document.createElement("div");
          particle.className = "confetti-particle";
          particle.style.left = `${rect.left + rect.width / 2}px`;
          particle.style.top = `${rect.top + rect.height / 2}px`;
          particle.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

          const angle = (Math.PI * 2 * i) / 8;
          const velocity = 60 + Math.random() * 40;
          particle.style.setProperty("--tx", `${Math.cos(angle) * velocity}px`);
          particle.style.setProperty("--ty", `${Math.sin(angle) * velocity}px`);
          particle.style.setProperty(
            "--rotation",
            `${Math.random() * 720 - 360}deg`
          );

          document.body.appendChild(particle);

          setTimeout(() => particle.remove(), 800);
        }
      };

      const handleToggle = useCallback(
        (taskId, event) => {
          const task = localTasks.find((t) => t.id === taskId);
          const wasCompleted = task?.completed;

          setJustToggledTaskId(taskId);

          if (!wasCompleted && event?.currentTarget) {
            createConfetti(event.currentTarget, wasCompleted);
          }

          setTimeout(() => setJustToggledTaskId(null), 600);

          setLocalTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            )
          );

          requestAnimationFrame(() => {
            toggleTask(groupId, taskId);
          });
        },
        [groupId, toggleTask, localTasks]
      );

      if (!group) return null;

      return (
        <div className={`tasks-overlay ${visible ? "visible" : ""}`}>
          <div className="tasks-panel">
            <div className="tasks-header" style={{ borderColor: group.color }}>
              <button className="btn-back" onClick={onClose}>
                ← Volver
              </button>
              <h2>{group.name}</h2>
              <div
                className="group-progress-big"
                style={{ color: group.color }}
              >
                {progress}%
              </div>
            </div>

            <div className="tasks-list">
              {localTasks.map((task) => (
                <button
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""} ${
                    justToggledTaskId === task.id ? "just-toggled" : ""
                  }`}
                  onClick={(e) => handleToggle(task.id, e)}
                >
                  <div
                    className="task-checkbox"
                    style={{ borderColor: group.color, color: group.color }}
                  >
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
                      <path d="M7 10v12" />
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
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
                <strong>
                  {localTasks.filter((t) => t.completed).length} /{" "}
                  {localTasks.length}
                </strong>
              </div>
              <div className="summary-item">
                <span>Progreso del grupo:</span>
                <strong style={{ color: group.color }}>{progress}%</strong>
              </div>
            </div>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.groupId === nextProps.groupId &&
        prevProps.visible === nextProps.visible
      );
    }
  );

  const ConfigPanel = () => {
    const [tempConfig, setTempConfig] = useState({
      ...JSON.parse(JSON.stringify(config)),
    });
    const [invalidGroups, setInvalidGroups] = useState([]);

    const updateGroupName = (groupId, name) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map((g) =>
          g.id === groupId ? { ...g, name } : g
        ),
      });
    };

    const updateTask = (groupId, taskId, field, value) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, [field]: field === "name" ? value : Number(value) }
                  : t
              ),
            };
          }
          return g;
        }),
      });
    };

    const normalizeWeights = (groupId) => {
      setTempConfig({
        ...tempConfig,
        groups: tempConfig.groups.map((g) => {
          if (g.id === groupId) {
            const total = g.tasks.reduce((sum, t) => sum + t.weight, 0);
            if (total === 0) {
              const equalWeight = Math.floor(100 / g.tasks.length);
              const remainder = 100 - equalWeight * g.tasks.length;
              return {
                ...g,
                tasks: g.tasks.map((t, index) => ({
                  ...t,
                  weight: index === 0 ? equalWeight + remainder : equalWeight,
                })),
              };
            } else {
              const normalizedTasks = g.tasks.map((t) => ({
                ...t,
                weight: Math.floor((t.weight / total) * 100),
              }));

              const sumAfterRounding = normalizedTasks.reduce(
                (sum, t) => sum + t.weight,
                0
              );
              const difference = 100 - sumAfterRounding;

              if (difference !== 0) {
                normalizedTasks[0].weight += difference;
              }

              return {
                ...g,
                tasks: normalizedTasks,
              };
            }
          }
          return g;
        }),
      });
    };

    const saveConfig = () => {
      const invalid = tempConfig.groups.filter((group) => {
        const total = group.tasks.reduce((sum, t) => sum + t.weight, 0);
        return total !== 100;
      });

      if (invalid.length > 0) {
        setInvalidGroups(invalid);
        return;
      }

      updateConfig(tempConfig);
      setShowConfig(false);
    };

    const resetWeek = () => {
      setShowResetModal(true);
    };

    return (
      <div className="config-panel">
        <div className="config-header">
          <h2>⚙️ Configuración</h2>
          <button className="btn-close" onClick={() => setShowConfig(false)}>
            ✕
          </button>
        </div>

        <div className="config-content">
          {tempConfig.groups.map((group) => {
            const totalWeight = group.tasks.reduce(
              (sum, t) => sum + t.weight,
              0
            );
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

                <div
                  className="weight-total"
                  style={{
                    color: needsNormalization ? "#ef4444" : "#10b981",
                  }}
                >
                  Total: {totalWeight}% {needsNormalization && "🔄"}
                </div>

                {group.tasks.map((task, index) => (
                  <div key={task.id} className="config-task-row">
                    <span className="task-number">{index + 1}</span>
                    <input
                      type="text"
                      className="config-input-name"
                      value={task.name}
                      onChange={(e) =>
                        updateTask(group.id, task.id, "name", e.target.value)
                      }
                      placeholder="Nombre de la tarea"
                    />
                    <div className="weight-input-group">
                      <input
                        type="number"
                        className="config-input-number"
                        value={task.weight}
                        onChange={(e) =>
                          updateTask(
                            group.id,
                            task.id,
                            "weight",
                            e.target.value
                          )
                        }
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
          {/* Sección de castigo de resurrección */}
          <section className="config-section death-penalty-section">
            <div className="death-penalty-header">
              <span className="death-penalty-icon">💀</span>
              <h3>Castigo de Resurrección</h3>
            </div>
            <p className="death-penalty-description">
              Este castigo deberás cumplirlo cuando tu vida llegue a 0 para
              poder revivir.
            </p>
            <input
              type="text"
              className="config-death-penalty"
              value={tempConfig.deathPenalty || ""}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, deathPenalty: e.target.value })
              }
              placeholder="Ej: Hacer 50 flexiones, invitar a café al equipo..."
            />
          </section>

          <div className="config-actions">
            <button type="button" className="btn-primary" onClick={saveConfig}>
              <Settings size={18} /> Guardar Cambios
            </button>
            <button type="button" className="btn-danger" onClick={resetWeek}>
              <RotateCcw size={18} /> Resetear Semana
            </button>
          </div>
        </div>

        {invalidGroups.length > 0 && (
          <div
            className="validation-modal-overlay"
            onClick={() => setInvalidGroups([])}
          >
            <div
              className="validation-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="validation-modal-icon">🔄</div>
              <h2 className="validation-modal-title">Grupos sin ajustar</h2>
              <p className="validation-modal-text">
                Los siguientes grupos no suman 100%:
              </p>
              <div className="validation-groups-list">
                {invalidGroups.map((group) => {
                  const total = group.tasks.reduce(
                    (sum, t) => sum + t.weight,
                    0
                  );
                  return (
                    <div key={group.id} className="validation-group-item">
                      <div className="validation-group-header">
                        <strong>{group.name}</strong>
                        <span
                          className="validation-group-total"
                          style={{ color: "#ef4444" }}
                        >
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
                        ✔ Ajustar a 100%
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

  const HistoryView = () => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString("es-ES", { month: "short" });
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
              <button
                className="btn-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-empty">
              <div className="history-empty-icon">📊</div>
              <p>Aún no hay historial</p>
              <p className="history-empty-text">
                Completa tu primera semana para ver tu progreso aquí
              </p>
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
            <button className="btn-close" onClick={() => setShowHistory(false)}>
              ✕
            </button>
          </div>

          <div className="history-list">
            {config.weekHistory.map((week, index) => {
              const progress = calculateWeekProgress(week.groups);
              const completedTasks = week.groups.reduce((sum, group) => {
                return sum + group.tasks.filter((t) => t.completed).length;
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
                        {formatDate(week.weekStart)} -{" "}
                        {formatDate(week.weekEnd)}
                      </span>
                      <span className="history-week-ago">
                        Hace {index === 0 ? "una" : index + 1} semana
                        {index !== 0 ? "s" : ""}
                      </span>
                    </div>
                    <div className="history-week-progress">{progress}%</div>
                  </div>

                  <div className="history-week-stats">
                    <div className="history-stat">
                      <span className="history-stat-value">
                        {completedTasks}/{totalTasks}
                      </span>
                      <span className="history-stat-label">Tareas</span>
                    </div>
                    <div className="history-hexagon-mini">
                      <svg viewBox="0 0 100 100" width="60" height="60">
                        <path
                          d={createMiniHexPath(week.groups, 40, () => 40)}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="1"
                        />
                        <path
                          d={createMiniHexPath(week.groups, 40, (group) => {
                            const groupProgress = calculateGroupProgress(group);
                            return 5 + (35 * groupProgress) / 100;
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

        {selectedWeekHistory && (
          <WeekDetailModal
            week={selectedWeekHistory}
            onClose={() => setSelectedWeekHistory(null)}
          />
        )}
      </div>
    );
  };

  const createMiniHexPath = (groups, maxRadius, radiusFunc) => {
    const centerX = 50;
    const centerY = 50;

    const getPoint = (angle, radius) => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(radians - Math.PI / 2),
        y: centerY + radius * Math.sin(radians - Math.PI / 2),
      };
    };

    const points = groups.map((group) => {
      const radius = radiusFunc(group);
      return getPoint(group.angle, radius);
    });

    return (
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
      " Z"
    );
  };

  const WeekDetailModal = ({ week, onClose }) => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const progress =
      week.groups.reduce((sum, group) => {
        return sum + calculateGroupProgress(group);
      }, 0) / week.groups.length;

    return (
      <div className="week-detail-overlay" onClick={onClose}>
        <div className="week-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="week-detail-header">
            <button className="btn-back" onClick={onClose}>
              ← Volver
            </button>
            <div className="week-detail-dates">
              <div className="week-detail-title">Semana del</div>
              <div className="week-detail-range">
                {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
              </div>
            </div>
            <div className="week-detail-progress">{progress.toFixed(1)}%</div>
          </div>

          <svg className="week-detail-hexagon" viewBox="0 0 500 500">
            <path
              d={createDetailHexPath(week.groups, () => 160)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            <path
              d={createDetailHexPath(week.groups, (group) => {
                const groupProgress = calculateGroupProgress(group);
                return 20 + (140 * groupProgress) / 100;
              })}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="#6366f1"
              strokeWidth="2"
            />

            {week.groups.map((group) => {
              const groupProgress = calculateGroupProgress(group);
              const radius = 20 + (140 * groupProgress) / 100;
              const point = getDetailPoint(group.angle, radius);
              const labelRadius = 210;
              const labelPoint = getDetailPoint(group.angle, labelRadius);

              return (
                <g key={group.id}>
                  <line
                    x1="250"
                    y1="250"
                    x2={point.x}
                    y2={point.y}
                    stroke={group.color}
                    strokeWidth="2"
                    opacity="0.5"
                  />

                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="10"
                    fill={group.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />

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

            <circle cx="250" cy="250" r="6" fill="#6366f1" />
          </svg>

          <div className="week-detail-groups">
            {week.groups.map((group) => (
              <div key={group.id} className="week-detail-group">
                <div
                  className="week-detail-group-header"
                  style={{ borderColor: group.color }}
                >
                  <h3 style={{ color: group.color }}>{group.name}</h3>
                  <span className="week-detail-group-progress">
                    {calculateGroupProgress(group)}%
                  </span>
                </div>
                <div className="week-detail-tasks">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="week-detail-task">
                      <span className="week-detail-task-icon">
                        {task.completed ? "✔" : "○"}
                      </span>
                      <span
                        className={`week-detail-task-name ${
                          task.completed ? "completed" : ""
                        }`}
                      >
                        {task.name}
                      </span>
                      <span className="week-detail-task-weight">
                        {task.weight}%
                      </span>
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

    const points = groups.map((group) => {
      const radius = radiusFunc(group);
      return getDetailPoint(group.angle, radius);
    });

    return (
      points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
      " Z"
    );
  };

  const getDetailPoint = (angle, radius) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: 250 + radius * Math.cos(radians - Math.PI / 2),
      y: 250 + radius * Math.sin(radians - Math.PI / 2),
    };
  };

  const CelebrationModal = () => {
    const [confettiPieces, setConfettiPieces] = useState([]);

    useEffect(() => {
      const pieces = [];
      for (let i = 0; i < 80; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          color: [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
          ][Math.floor(Math.random() * 6)],
        });
      }
      setConfettiPieces(pieces);
    }, []);

    const handleClose = () => {
      setShowCelebration(false);
      setShowEpicAnimation(false);
      setEpicAnimationTriggered(true);
    };

    return (
      <div className="celebration-overlay" onClick={handleClose}>
        <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti-fall"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                backgroundColor: piece.color,
              }}
            />
          ))}

          <div className="celebration-content">
            <div className="celebration-icon">🎁‰</div>
            <h1 className="celebration-title">¡INCREÍBLE!</h1>
            <p className="celebration-subtitle">
              Has completado todos tus objetivos
            </p>
            <div className="celebration-stats">
              <div className="celebration-stat">
                <div className="celebration-stat-number">100%</div>
                <div className="celebration-stat-label">Completado</div>
              </div>
              <div className="celebration-stat">
                <div className="celebration-stat-number">
                  {config.groups.length}
                </div>
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

  const ResetConfirmModal = () => {
    const confirmReset = () => {
      const celebrationKey = `celebration-shown-${config.weekStart}`;
      localStorage.removeItem(celebrationKey);

      setEpicAnimationTriggered(false);
      setShowEpicAnimation(false);
      setCelebrationShown(false);

      const weekStart = new Date(config.weekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekRecord = {
        weekStart: config.weekStart,
        weekEnd: weekEnd.toISOString().split("T")[0],
        groups: JSON.parse(JSON.stringify(config.groups)),
      };

      const updatedHistory = [weekRecord, ...(config.weekHistory || [])].slice(
        0,
        52
      );

      const resetData = {
        ...config,
        groups: config.groups.map((group) => ({
          ...group,
          tasks: group.tasks.map((task) => ({
            ...task,
            completed: false,
          })),
        })),
        weekStart: new Date().toISOString().split("T")[0],
        weekHistory: updatedHistory,
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
          <div className="reset-modal-icon">🗑️</div>
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

  const ShopPanel = () => {
    const buyItem = (item) => {
      if (config.coins < item.price) {
        showNoCoinsNotification();
        return;
      }

      let updates = {
        coins: config.coins - item.price,
        purchasedItems: [...(config.purchasedItems || []), item],
      };

      if (item.type === "heal") {
        const healAmount = item.healAmount || 20;
        updates.health = Math.min(config.maxHealth, config.health + healAmount);
        showHealthNotification(healAmount);
      } else if (item.type === "skip_task") {
        showSkipSmallNotification();
      } else if (item.type === "complete_group") {
        showSkipBigNotification();
      } else {
        showDefaultNotification();
      }

      updateConfig(updates);
    };

    return (
      <div className="shop-overlay" onClick={() => setShowShop(false)}>
        <div className="shop-panel" onClick={(e) => e.stopPropagation()}>
          <div className="shop-header">
            <h2
              style={{
                paddingRight: "5%",
              }}
            >
              🛒 Tienda
            </h2>
            <div className="player-coins">
              <Coins size={20} color="#f59e0b" fill="#f59e0b" />
              <span>{config.coins}</span>
            </div>
            <button
              className="btn-settings"
              onClick={(e) => {
                e.stopPropagation();
                setShowShopConfig(true);
              }}
              style={{ marginLeft: "auto", marginRight: "0.5rem" }}
            >
              <Settings size={18} />
            </button>
            <button className="btn-close" onClick={() => setShowShop(false)}>
              ✕
            </button>
          </div>

          <div className="shop-content">
            {config.shopItems.map((item) => (
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

  const ShopConfigPanel = () => {
    const [tempShopItems, setTempShopItems] = useState([
      ...JSON.parse(JSON.stringify(config.shopItems)),
    ]);

    const updateShopItem = (itemId, field, value) => {
      setTempShopItems(
        tempShopItems.map((item) => {
          if (item.id === itemId) {
            if (field === "price" || field === "healAmount") {
              return { ...item, [field]: Number(value) };
            }
            return { ...item, [field]: value };
          }
          return item;
        })
      );
    };

    const addShopItem = () => {
      const newId = Math.max(0, ...tempShopItems.map((item) => item.id)) + 1;

      const newItem = {
        id: newId,
        name: "Nuevo item",
        description: "Descripción del item",
        price: 10,
        type: "custom",
        icon: "⭐",
      };

      setTempShopItems((items) => [...items, newItem]);
    };

    const deleteShopItem = (itemId) => {
      if (tempShopItems.length <= 1) {
        showItemNotification();
        return;
      }

      setTempShopItems((items) => items.filter((item) => item.id !== itemId));
    };

    const saveShopConfig = () => {
      const invalidItems = tempShopItems.filter((item) => {
        const price = Number(item.price);
        const heal = Number(item.healAmount);

        if (Number.isNaN(price) || price <= 0) return true;

        if (item.type === "heal") {
          if (Number.isNaN(heal) || heal <= 0) return true;
        }

        return false;
      });

      updateConfig({ shopItems: tempShopItems });
      setShowShopConfig(false);
      showShopConfifNotification();
    };

    return (
      <div className="shop-overlay" onClick={() => setShowShopConfig(false)}>
        <div
          className="shop-panel"
          style={{ maxWidth: "700px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shop-header">
            <h2>⚙️ Configurar Tienda</h2>
            <button
              className="btn-close"
              onClick={() => setShowShopConfig(false)}
            >
              ✕
            </button>
          </div>

          <div className="shop-content" style={{ padding: "2rem" }}>
            {tempShopItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{item.icon}</span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateShopItem(item.id, "name", e.target.value)
                    }
                    placeholder="Nombre del item"
                    style={{
                      minWidth: 0,
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: "700",
                    }}
                  />

                  <button
                    className="btn-delete-item"
                    onClick={() => deleteShopItem(item.id)}
                    title="Eliminar item"
                  >
                    {" "}
                    🗑️
                  </button>
                </div>

                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateShopItem(item.id, "description", e.target.value)
                  }
                  placeholder="Descripción"
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    color: "#fff",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.6)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Precio
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateShopItem(item.id, "price", e.target.value)
                        }
                        min="1"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          borderRadius: "8px",
                          padding: "0.75rem",
                          color: "#f59e0b",
                          fontSize: "1rem",
                          fontWeight: "700",
                          fontFamily: "'Space Mono', monospace",
                        }}
                      />
                      <Coins size={20} color="#f59e0b" fill="#f59e0b" />
                    </div>
                  </div>

                  {item.type === "heal" && (
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          color: "rgba(255, 255, 255, 0.6)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Vida recuperada
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="number"
                          value={item.healAmount ?? 20}
                          onChange={(e) =>
                            updateShopItem(
                              item.id,
                              "healAmount",
                              Number(e.target.value)
                            )
                          }
                          min="1"
                          max={config.maxHealth}
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            color: "#ef4444",
                            fontSize: "1rem",
                            fontWeight: "700",
                            fontFamily: "'Space Mono', monospace",
                          }}
                        />
                        <Heart size={20} color="#ef4444" fill="#ef4444" />
                      </div>
                    </div>
                  )}
                </div>
                <select
                  className="config-select-type"
                  value={item.type}
                  onChange={(e) =>
                    updateShopItem(item.id, "type", e.target.value)
                  }
                >
                  <option value="custom">Personalizado</option>
                  <option value="heal">Curación</option>
                </select>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button className="btn-add-item" onClick={addShopItem}>
                ➕ Añadir Item
              </button>
              <button
                onClick={saveShopConfig}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  border: "none",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                💾 Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeathScreen = () => {
    const handleRevive = () => {
      if (confirm(`¿Has completado el castigo: "${config.deathPenalty}"?`)) {
        updateConfig({
          health: 25,
          isDead: false,
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
            ✔ He Completado el Castigo
          </button>

          <p className="revive-note">Revivirás con 25 HP</p>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">HABITO CIUDAD</div>
        <div className="player-stats">
          <div className="stat-item health-stat">
            <Heart
              size={18}
              color="#ef4444"
              fill={config.health > 25 ? "#ef4444" : "none"}
            />
            <span className="stat-value">
              {config.health}/{config.maxHealth}
            </span>
          </div>
          <div className="stat-item coins-stat">
            <Coins size={18} color="#f59e0b" fill="#f59e0b" />
            <span className="stat-value">{config.coins}</span>
          </div>
        </div>
        <div className="header-actions">
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

      {showShopConfig && <ShopConfigPanel />}

      {showDeathScreen && <DeathScreen />}
    </div>
  );
}

export default HabitHeroWeekly;
