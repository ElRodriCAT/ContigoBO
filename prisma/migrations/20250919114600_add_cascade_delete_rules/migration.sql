-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DetalleVenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" REAL NOT NULL,
    CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DetalleVenta" ("cantidad", "id", "precio", "productoId", "ventaId") SELECT "cantidad", "id", "precio", "productoId", "ventaId" FROM "DetalleVenta";
DROP TABLE "DetalleVenta";
ALTER TABLE "new_DetalleVenta" RENAME TO "DetalleVenta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
