// pages/index.js
import Head from "next/head";
import Calendar from "../../components/Calendar";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div className="app mt-4">
      <Head>
        <h1 className="text-4xl text-center mb-4">Habit Tracker 📅</h1>
      </Head>
      <main>
        <h1 className="text-4xl text-center mb-4">Habit Tracker 📅</h1>
      </main>
      <Calendar />
    </div>
  );
}
