import { artifacts } from './artifacts';

export const collections = [
  { id: 'ritual-vessels', title: 'Ritual Vessels', eyebrow: 'Material culture', description: 'Containers whose forms, repairs, and surface evidence reveal ritual and domestic practices.', ids: ['amphora-317','urn-140','vessel-731'], tone: 'bronze' },
  { id: 'inscribed-surfaces', title: 'Inscribed Surfaces', eyebrow: 'Writing & memory', description: 'Artifacts where signs, inscriptions, seals, and tool marks carry the primary research value.', ids: ['tablet-455','seal-061','stele-089'], tone: 'scan' },
  { id: 'fragmentary-bodies', title: 'Fragmentary Bodies', eyebrow: 'Reconstruction', description: 'Objects assembled digitally from incomplete physical evidence, with inferred geometry clearly flagged.', ids: ['amphora-317','relief-512','coin-hoard-22'], tone: 'rust' },
  { id: 'surface-colour', title: 'Surface & Pigment', eyebrow: 'Imaging', description: 'Records where raking light, photogrammetry, and colour mapping reveal evidence beyond normal viewing.', ids: ['mask-204','relief-512','stele-089'], tone: 'verdigris' },
];

export const collectionStats = collections.map((collection) => ({
  ...collection,
  artifacts: collection.ids.map((id) => artifacts.find((artifact) => artifact.id === id)).filter(Boolean),
}));
