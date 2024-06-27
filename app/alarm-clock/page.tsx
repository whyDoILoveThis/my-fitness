"use client";
import { useState, useEffect } from "react";

const soundClips = [
  "/sounds/motivation1.mp3",
  "/sounds/motivation2.mp3",
  "/sounds/motivation3.mp3",
  "/sounds/motivation4.mp3",
  "/sounds/motivation5.mp3",
  "/sounds/motivation6.mp3",
];

const getRandomSnoozeTime = () => {
  return Math.floor(Math.random() * (15 - 5 + 1)) + 5;
};

const Alarm = () => {
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [alarmTimeout, setAlarmTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentSound, setCurrentSound] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    setIsClient(true); // Set to true to indicate that we are now on the client side
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      alarmTime &&
      currentTime.getHours() === alarmTime.getHours() &&
      currentTime.getMinutes() === alarmTime.getMinutes()
    ) {
      playAlarm();
    }
  }, [currentTime, alarmTime]);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    playSound(snoozeCount);
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
    }
  };

  const handleSnooze = () => {
    playSound(snoozeCount);

    if (snoozeCount < 5) {
      setSnoozeCount(snoozeCount + 1);
    } else {
      const snoozeTime = getRandomSnoozeTime();
      console.log(`Snoozing for ${snoozeTime} minutes`);
      setSnoozeCount(0);
      stopAlarm();
      setAlarmTimeout(setTimeout(playAlarm, snoozeTime * 60000));
    }
  };

  const handleAlarmTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [hours, minutes] = event.target.value.split(":");
    const newAlarmTime = new Date();
    newAlarmTime.setHours(parseInt(hours, 10));
    newAlarmTime.setMinutes(parseInt(minutes, 10));
    newAlarmTime.setSeconds(0);
    setAlarmTime(newAlarmTime);
  };

  const playSound = (index: number) => {
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
    }

    const audio = new Audio(soundClips[index]);
    audio.oncanplaythrough = () => {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        alert("Error playing audio, check console for details.");
      });
    };
    setCurrentSound(audio);
    audio.load();
  };

  return (
    <div>
      <h1>Unstoppable Alarm ⏰️ 😤 😫 😪</h1>
      <div>
        <h2>
          Current Time: {isClient ? currentTime.toLocaleTimeString() : ""}
        </h2>
        <label>
          Set Alarm Time:
          <input type="time" onChange={handleAlarmTimeChange} />
        </label>
      </div>
      {isAlarmPlaying && <button onClick={handleSnooze}>Snooze</button>}
    </div>
  );
};

export default Alarm;
