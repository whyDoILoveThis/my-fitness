// pages/index.js
import Head from "next/head";
import Calendar from "../components/Calendar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="app mt-4">
      <Head>
        <title>Habit Tracker</title>
      </Head>
      <main>
        <h1 className="text-4xl text-center mb-4">Habit Tracker 📅</h1>
        <div className="flex justify-center">
          <Link className=" link link-active" href="/">
            Calendar
          </Link>
          <Link className=" link" href="/overlook">
            Overlook
          </Link>
          <Link className="link" href="/graph">
            Graph
          </Link>
        </div>
      </main>
      <Calendar />
    </div>
  );
}
