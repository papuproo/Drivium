import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Sembrando datos dummy...');

    await prisma.vehicleImage.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    const seller = await prisma.user.create({
        data: {
            email: 'vendedor1@automarket.test',
            passwordHash,
            firstName: 'Premier',
            lastName: 'Auto Group',
            phone: '+52 55 1550 9464',
            role: 'SELLER',
            verificationStatus: 'VERIFIED',
            city: 'Monterrey',
            state: 'Nuevo León',
            ratingAvg: 4.6,
            ratingCount: 123
        }
    });

    const buyer = await prisma.user.create({
        data: {
            email: 'comprador@automarket.test',
            passwordHash,
            firstName: 'Ana',
            lastName: 'García',
            role: 'BUYER',
            verificationStatus: 'VERIFIED',
            city: 'CDMX',
            state: 'CDMX'
        }
    });

    await prisma.vehicle.create({
        data: {
            sellerId: seller.id,
            make: 'Tesla',
            model: 'Model Y',
            trim: 'Long Range',
            year: 2023,
            bodyType: 'SUV',
            condition: 'USED',
            fuelType: 'ELECTRIC',
            transmission: 'AUTOMATIC',
            mileage: 12045,
            exteriorColor: 'Pearl White',
            interiorColor: 'Black Premium',
            rangeMiles: 330,
            price: 42500,
            originalPrice: 44200,
            description: 'Tesla Model Y Long Range en condición impecable, un solo dueño y siempre en garaje.',
            status: 'ACTIVE',
            featured: true,
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            latitude: 30.2672,
            longitude: -97.7431,
            publishedAt: new Date(),
            viewsCount: 340,
            images: {
                create: [
                    {
                        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1VAhsVC_7re4yEHLhzBmy4g6ADYabLHsQf3PxFGhgvyrPJQOHq34sRLTQ4eeCOeHHHKOZnNwu1riGTvV1tn7QpNg8CoNhvAYyi00qHYQNdTNmJxZlD-qQXe-6BeUnAWIrwMc1fxrUdPKC3eKL06j1DmGXztvVcoOxidluzH27K6I3Xkj9jvwMgwXdsSd4rDxcbeV1WZu-7Rw5rzbsS_l3d-eJ1xTGi7NnA6_qBo5DSJSOYa82JmPBqVk9lg2aP3GDTIsKwJr4PERS',
                        isPrimary: true,
                        position: 0,
                        altText: 'Tesla Model Y blanco estacionado'
                    }
                ]
            }
        }
    });

    await prisma.vehicle.create({
        data: {
            sellerId: seller.id,
            make: 'BMW',
            model: 'M5',
            trim: 'Competition',
            year: 2024,
            bodyType: 'SEDAN',
            condition: 'USED',
            fuelType: 'GASOLINE',
            transmission: 'AUTOMATIC',
            mileage: 5200,
            horsepower: 617,
            price: 115000,
            status: 'ACTIVE',
            featured: true,
            city: 'Austin',
            state: 'TX',
            publishedAt: new Date(),
            viewsCount: 210
        }
    });

    console.log(`Listo, vendedor: ${seller.email} / Comprador: ${buyer.email}`);
    console.log('Contraseña para ambos: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
