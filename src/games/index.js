import plus from "./plus.js";
import minus from "./minus.js";
import tables from "./tables.js";
import multiply from "./multiply.js";
import divide from "./divide.js";
import percent from "./percent.js";
import fractions from "./fractions.js";
import decimals from "./decimals.js";

export const MATH_MODULES = { plus, minus, tables, multiply, divide, percent, fractions, decimals };

export const GAME_MODES = [
  { id:"classic",  label:"Classic",        icon:"◎", desc:"Rustige training, stop wanneer je wil" },
  { id:"time",     label:"Time Attack",    icon:"⏱", desc:"60 seconden — maximale score" },
  { id:"survival", label:"Survival",       icon:"💀", desc:"3 levens — fout = verlies" },
  { id:"combo",    label:"Combo",          icon:"🔥", desc:"Streak multiplier opbouwen" },
  { id:"brain",    label:"Brain Trainer",  icon:"🧠", desc:"Adaptive focus op zwakste module" },
  { id:"daily",    label:"Daily Challenge",icon:"🎯", desc:"10 vaste vragen van vandaag" },
];
