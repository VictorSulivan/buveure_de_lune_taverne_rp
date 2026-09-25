export const GRADES = ["admin", "employe", "co_patron", "patron"] as const;
export type Grade = (typeof GRADES)[number];

export const LABEL_GRADE: Record<string, string> = {
  admin: "Admin",
  employe: "Employé",
  co_patron: "Co-Patron",
  patron: "Patron",
  stagiaire: "Employé",
};

export const COULEUR_GRADE: Record<string, string> = {
  patron: "bg-[#6b3e22] text-[#f3d7a5] border-[#a06b3c]",
  co_patron: "bg-amber-700/20 text-amber-300 border-amber-600/30",
  admin: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  employe: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  stagiaire: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export const TYPES_CONTRAT = ["Admin", "Employé", "Co-Patron", "Patron"] as const;

export function labelGrade(role: string) {
  return LABEL_GRADE[role] ?? role.replaceAll("_", " ");
}

export function typeContratDepuisRole(role: string) {
  return LABEL_GRADE[role] ?? "Employé";
}

export function roleDepuisTypeContrat(type: string): Grade {
  const map: Record<string, Grade> = {
    Admin: "admin",
    Employé: "employe",
    "Co-Patron": "co_patron",
    Patron: "patron",
  };
  return map[type] ?? "employe";
}
