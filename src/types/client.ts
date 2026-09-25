export type OrganisationLite = {
  id: number;
  nom: string;
  type: string;
};

export type AffiliationLite = {
  id: number;
  dateDebut: Date | string;
  dateFin: Date | string | null;
  organisation: OrganisationLite;
};

export type ClientAvecAffiliations = {
  id: number;
  nom: string;
  prenom: string | null;
  typeClient?: string | null;
  affiliations: AffiliationLite[];
};
