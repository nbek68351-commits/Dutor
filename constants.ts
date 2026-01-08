
import { Note, Language, Translations } from './types';

export const DUTOR_NOTES: Note[] = [
  { name: 'Do', freq: 523 },
  { name: 'Do#', freq: 554 },
  { name: 'Re', freq: 587 },
  { name: 'Re#', freq: 622 },
  { name: 'Mi', freq: 659 },
  { name: 'Fa', freq: 698 },
  { name: 'Fa#', freq: 739 },
  { name: 'Co', freq: 783 },
  { name: 'Co#', freq: 830 },
  { name: 'Li', freq: 879 },
  { name: 'Li#', freq: 932 },
  { name: 'Si', freq: 987 }
];

export const TRANSLATIONS: Record<Language, Translations> = {
  uz: {
    title: "Dutor Tyuneri",
    startTuning: "Tyunerni boshlash",
    stopTuning: "Tyunerni to'xtatish",
    history: "Tarix",
    correct: "To'g'ri",
    programmer: "Dasturchi: Jubatkhanov Nurlan",
    frequency: "Chastota",
    clearHistory: "Tarixni tozalash",
    noHistory: "Hali hech qanday ovoz yozilmadi",
    currentNote: "Joriy nota",
    detected: "Aniqlangan",
    micPermission: "Iltimos, mikrofonga ruxsat bering",
    menu: "Menyu",
    tuner: "Tyuner"
  },
  kk: {
    title: "Дутар Тюнері",
    startTuning: "Тюнерді бастау",
    stopTuning: "Тюнерді тоқтату",
    history: "Тарих",
    correct: "Дұрыс",
    programmer: "Бағдарламашы: Джубатханов Нұрлан",
    frequency: "Жиілік",
    clearHistory: "Тарихты тазалау",
    noHistory: "Әлі дыбыс жазылмады",
    currentNote: "Ағымдағы нота",
    detected: "Анықталған",
    micPermission: "Микрофонға рұқсат беріңіз",
    menu: "Мәзір",
    tuner: "Тюнер"
  },
  ru: {
    title: "Тюнер Дутара",
    startTuning: "Запустить тюнер",
    stopTuning: "Остановить тюнер",
    history: "История",
    correct: "Правильно",
    programmer: "Программист: Джубатханов Нурлан",
    frequency: "Частота",
    clearHistory: "Очистить историю",
    noHistory: "Звуки еще не зафиксированы",
    currentNote: "Текущая нота",
    detected: "Обнаружено",
    micPermission: "Пожалуйста, дайте доступ к микрофону",
    menu: "Меню",
    tuner: "Тюнер"
  }
};
