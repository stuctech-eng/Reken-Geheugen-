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

// Oefen modus — altijd zichtbaar, difficulty via module level
export const PRACTICE_MODULES = [
  { id:"practice_all", label:"Alles",            icon:"*",  modId:null,        unlockedAt:0 },
  { id:"practice_plus",      label:"Optellen",        icon:"+",  modId:"plus",      unlockedAt:0 },
  { id:"practice_minus",     label:"Aftrekken",       icon:"-",  modId:"minus",     unlockedAt:0 },
  { id:"practice_tables",    label:"Tafels",          icon:"x",  modId:"tables",    unlockedAt:0 },
  { id:"practice_multiply",  label:"Vermenigvuldigen",icon:"xx", modId:"multiply",  unlockedAt:1 },
  { id:"practice_divide",    label:"Delen",           icon:"/",  modId:"divide",    unlockedAt:2 },
  { id:"practice_percent",   label:"Procenten",       icon:"%",  modId:"percent",   unlockedAt:2 },
  { id:"practice_fractions", label:"Breuken",         icon:"1/", modId:"fractions", unlockedAt:3 },
  { id:"practice_decimals",  label:"Decimalen",       icon:",",  modId:"decimals",  unlockedAt:3 },
];
