// Deterministic "human" emoji avatar for a given person, so every account gets a
// distinct, friendly face instead of a plain letter. No network/image upload needed.
const FACES=['🧑\u200d💻','👩\u200d💼','🧑\u200d🔧','👨\u200d🔬','🧑\u200d🎨','👩\u200d🚀','🧑\u200d⚕️','👨\u200d💼','🧑\u200d🏫','👩\u200d💻','🧑\u200d🚀','👨\u200d🎨','🧑\u200d🔬','👩\u200d🔧','👩\u200d✈️','🧑\u200d🎤'];

function hashKey(key){let h=0;for(let i=0;i<key.length;i++){h=(h*31+key.charCodeAt(i))>>>0;}return h;}

/** A stable emoji face for this person, based on their id/email/name. */
export function personEmoji(person){
  const key=String(person?._id||person?.id||person?.email||person?.name||'anon');
  return FACES[hashKey(key)%FACES.length];
}

/** Fallback initial, used for aria-labels and anywhere text-only is needed. */
export function initials(person){return (person?.name||'S')[0]?.toUpperCase()||'S';}
