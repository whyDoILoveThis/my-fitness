interface Props {
  setAlarm: (time: string) => void;
  snooze: () => void;
}

const AlarmControls: React.FC<Props> = ({ setAlarm, snooze }) => {
  const handleSetAlarm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const alarmTime = formData.get("alarmTime") as string;
    setAlarm(alarmTime);
  };

  return (
    <div>
      <form onSubmit={handleSetAlarm}>
        <label htmlFor="alarmTime">Set Alarm Time:</label>
        <input type="time" id="alarmTime" name="alarmTime" />
        <button type="submit">Set Alarm</button>
      </form>
      <button onClick={snooze}>Snooze</button>
    </div>
  );
};

export default AlarmControls;
