// pages/index.js
import Head from "next/head";
import Calendar from "../components/Calendar";
import AllMonths from "@/components/AllMonths";

export default function Home() {
  return (
    <div className="app">
      <Head>
        <title>Habit Tracker</title>
      </Head>
      <main>
        <h1>Habit Tracker 📅</h1>
        <Calendar />
        <h1>past</h1>
        <AllMonths />
      </main>
    </div>
  );
}
