import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_TOPPINGS = [
  { name: 'Katsuobushi', status: 'Tersedia', color: '#10b981', pct: 100 },
  { name: 'Keju Mozza', status: 'Tersedia', color: '#10b981', pct: 100 },
  { name: 'Sosis Ayam', status: 'Tersedia', color: '#10b981', pct: 100 },
  { name: 'Crabstick', status: 'Tersedia', color: '#10b981', pct: 100 },
  { name: 'Kornet Gurih', status: 'Habis', color: '#ef4444', pct: 0 },
];

// GET: Mengambil seluruh daftar topping dari database dengan multi-column tie breaker
export async function GET() {
  try {
    let toppings = await prisma.topping.findMany({
      orderBy: [
        { createdAt: 'asc' },
        { name: 'asc' },
      ],
    });

    // Seed otomatis jika tabel Topping di database masih kosong
    if (toppings.length === 0) {
      await prisma.topping.createMany({
        data: INITIAL_TOPPINGS,
      });
      toppings = await prisma.topping.findMany({
        orderBy: [
          { createdAt: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    // Normalisasi 'Aman' atau status lainnya menjadi 'Tersedia' / 'Habis' (2-state logic)
    const normalized = toppings.map((t) => {
      const isHabis = t.status === 'Habis' || t.pct === 0;
      return {
        ...t,
        status: isHabis ? 'Habis' : 'Tersedia',
        color: isHabis ? '#ef4444' : '#10b981',
        pct: isHabis ? 0 : 100,
      };
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Gagal mengambil data topping:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data topping' },
      { status: 500 }
    );
  }
}

// POST: Menambahkan topping baru (Default: Tersedia)
export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama topping tidak boleh kosong' },
        { status: 400 }
      );
    }

    const created = await prisma.topping.create({
      data: {
        name: name.trim(),
        status: 'Tersedia',
        color: '#10b981',
        pct: 100,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Gagal menambahkan topping:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan topping' },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui status ketersediaan topping (2-State: Tersedia <-> Habis)
export async function PUT(req) {
  try {
    const { id, name, status } = await req.json();

    let target = null;
    if (id && String(id).length > 10) {
      target = await prisma.topping.findUnique({ where: { id: String(id) } });
    }
    if (!target && name) {
      target = await prisma.topping.findFirst({ where: { name: String(name).trim() } });
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Topping tidak ditemukan di database' },
        { status: 404 }
      );
    }

    // Paksa hanya 2 kondisi: Tersedia atau Habis
    const isHabis = status === 'Habis';
    const finalStatus = isHabis ? 'Habis' : 'Tersedia';
    const finalColor = isHabis ? '#ef4444' : '#10b981';
    const finalPct = isHabis ? 0 : 100;

    const updated = await prisma.topping.update({
      where: { id: target.id },
      data: {
        status: finalStatus,
        color: finalColor,
        pct: finalPct,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Gagal memperbarui status topping:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui topping' },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus topping dari daftar
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID topping diperlukan' },
        { status: 400 }
      );
    }

    await prisma.topping.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Topping berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus topping:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus topping' },
      { status: 500 }
    );
  }
}
