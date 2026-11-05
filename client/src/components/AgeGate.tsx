import { Logo } from "@/components/Bits";
import { useEffect, useState } from "react";

const KEY = "wickd_age_ok";

function readStored(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * 21+ gate, as the packaging requires. Sits over the public pages until the
 * visitor answers; the answer is remembered on this device only.
 */
export function AgeGate() {
  const [ok, setOk] = useState(true);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    setOk(readStored());
  }, []);

  useEffect(() => {
    if (ok) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ok]);

  if (ok) return null;

  const confirm = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* asked again next visit */
    }
    setOk(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#07030f]/80 p-5 backdrop-blur-md"
    >
      <div className="nebula card-sticker pop-in relative w-full max-w-md px-7 pb-9 pt-10 text-center sm:px-10">
        <Logo eager className="mx-auto h-auto w-52 -rotate-3" />
        <div className="mx-auto mt-6 flex h-16 w-16 -rotate-6 items-center justify-center rounded-full border-[3px] border-black bg-white font-display text-xl text-black shadow-[3px_3px_0_#000]">
          21+
        </div>
        {declined ? (
          <>
            <h1 id="age-title" className="sticker mt-5 text-4xl">
              Come back later
            </h1>
            <p className="mt-3 text-white/70">You need to be 21 or older to see WICK'D products.</p>
            <button type="button" onClick={() => setDeclined(false)} className="btn btn-line mt-7">
              Go back
            </button>
          </>
        ) : (
          <>
            <h1 id="age-title" className="sticker mt-5 text-4xl">
              Are you 21+?
            </h1>
            <p className="mt-3 text-white/70">
              WICK'D products are for adults 21 and over. Confirm your age to enter.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={confirm} className="btn btn-accent">
                Yes, I'm 21+
              </button>
              <button type="button" onClick={() => setDeclined(true)} className="btn btn-line">
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
