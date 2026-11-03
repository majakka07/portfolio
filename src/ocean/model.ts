import { Mesh, Object3D, Texture } from 'three';

/** A loaded GLB is owned by this mount, never cached across renderer lifetimes. */
export function disposeModel(root: Object3D) {
  const disposed = new Set<unknown>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    if (!disposed.has(object.geometry)) {
      object.geometry.dispose();
      disposed.add(object.geometry);
    }
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      if (disposed.has(material)) continue;
      for (const value of Object.values(material)) {
        if (value instanceof Texture && !disposed.has(value)) {
          value.dispose();
          disposed.add(value);
        }
      }
      material.dispose();
      disposed.add(material);
    }
  });
}
