// src/data/pages.js
import OverviewImg from "../assets/img/pages/overview.jpg";
import TransactionsImg from "../assets/img/pages/transactions.jpg";

import { Routes } from "../routes";

export default [
  {
    id: 1,
    name: "Главная",
    image: OverviewImg,
    link: Routes.Main.path,
  },
  {
    id: 2,
    name: "Дерево изделия",
    image: TransactionsImg,
    link: Routes.Second.path,
  },
];
