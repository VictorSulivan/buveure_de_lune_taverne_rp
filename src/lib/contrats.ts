export type ArticleContrat = {
  titre: string;
  contenu: string;
};

export function articlesProposition(opts: {
  entreprise: string;
  employePrenom: string;
  employeNom: string;
  grade: string;
}): ArticleContrat[] {
  const nom = `${opts.employePrenom} ${opts.employeNom}`.trim();
  const deGrade = /^[aeiouéèêàâ]/i.test(opts.grade) ? `d'${opts.grade}` : `de ${opts.grade}`;
  return [
    {
      titre: "De l'engagement (presque) volontaire",
      contenu: `${nom} jure, la main sur un pichet encore tiède, servir ${opts.entreprise} au grade ${deGrade}. Toute réclamation du type « je croyais seulement goûter le menu » sera tenue pour une farce de mauvais goût.`,
    },
    {
      titre: "Des horaires élastiques",
      contenu: "Le service commence quand la porte grince et s'achève quand le dernier ivrogne se souvient de son nom. Les « juste cinq minutes » de la direction peuvent durer jusqu'à l'aube, parfois jusqu'à la prochaine lune.",
    },
    {
      titre: "Des pourboires égarés",
      contenu: `Toute pièce qui roule sous un tonneau, un tabouret ou la patience d'un client appartient à la maison. ${nom} pourra les ramasser, mais les compter à voix haute serait d'une impolitesse rare.`,
    },
    {
      titre: "Du silence des tonneaux",
      contenu: "Ce qui se dit après la troisième chope, dans la cave ou derrière le comptoir, n'a jamais existé. En cas de mémoire trop vive, la direction se réserve le droit d'offrir une tournée jusqu'à l'oubli.",
    },
    {
      titre: "De la dégustation obligatoire",
      contenu: `Pour « contrôler la qualité », ${nom} pourra être prié de goûter ragoûts douteux, hydromels trop jeunes et pâtés oubliés. Tout malaise sera imputé à un excès d'enthousiasme professionnel.`,
    },
    {
      titre: "Du droit de tapage",
      contenu: `En cas de bagarre de bardes, de fût percé ou de client qui croit payer en chansons, ${nom} accourra sans discuter. Les bleus, taches de vin et oreilles tordues sont des insignes d'honneur, non des accidents du travail.`,
    },
  ];
}

export function parseArticles(value: unknown): ArticleContrat[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((a) => ({
      titre: typeof a?.titre === "string" ? a.titre : "",
      contenu: typeof a?.contenu === "string" ? a.contenu : "",
    }))
    .filter((a) => a.titre.trim() || a.contenu.trim());
}

export function chiffreRomain(n: number): string {
  const uns = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
  const dix = ["", "X", "XX", "XXX", "XL", "L"];
  if (n <= 0 || n >= 60) return String(n);
  return `${dix[Math.floor(n / 10)]}${uns[n % 10]}`;
}
