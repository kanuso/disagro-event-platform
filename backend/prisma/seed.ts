import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---- SERVICIOS ----
  const servicios = [
    { name: "Mantenimiento Preventivo", description: "Revisión general de equipos", price: 250 },
    { name: "Capacitación Técnica", description: "Taller para operadores", price: 800 },
    { name: "Análisis de Suelos", description: "Estudio de laboratorio", price: 1200 },
    { name: "Asesoría Agronómica", description: "Consultoría en campo", price: 950 },
    { name: "Instalación de Riego", description: "Sistema de riego por goteo", price: 3500 },
  ];

  for (let i = 0; i < servicios.length; i++) {
    await prisma.service.upsert({
      where: { id: i + 1 },
      update: {},
      create: servicios[i],
    });
  }

  // ---- PRODUCTOS ----
  const productos = [
    { name: "Fertilizante NPK 15-15-15", description: "Saco 50kg", price: 350 },
    { name: "Urea 46%", description: "Saco 50kg", price: 280 },
    { name: "Fungicida Max Forte", description: "Bidón 1L", price: 420 },
    { name: "Herbicida Glifosato", description: "Bidón 4L", price: 190 },
    { name: "Semilla Maíz DK-390", description: "Bolsa 20kg", price: 620 },
    { name: "Bioestimulante Foliar", description: "Bidón 1L", price: 210 },
    { name: "Insecticida Cipermetrina", description: "Frasco 500ml", price: 165 },
  ];

  for (let i = 0; i < productos.length; i++) {
    await prisma.product.upsert({
      where: { id: i + 1 },
      update: {},
      create: productos[i],
    });
  }

  console.log("✅ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });