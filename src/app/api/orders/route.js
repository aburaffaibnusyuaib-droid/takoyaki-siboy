import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper pembersih angka agar anti-NaN
const sanitizeNumber = (val) => {
  if (typeof val === 'number') return Math.round(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

// GET: Ambil daftar pesanan, single detail, atau nomor antrean berikutnya
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    // 1. Single Order untuk Karcis / Ticket Tracker
    if (id) {
      const singleOrder = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!singleOrder) {
        return NextResponse.json(
          { success: false, message: 'Pesanan tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: singleOrder });
    }

    // 2. Generator Nomor Antrean Harian (Anti-Duplikat meskipun ada baris dihapus)
    if (action === 'next_queue') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Cari order hari ini dengan id terakhir
      const lastOrderToday = await prisma.order.findFirst({
        where: {
          createdAt: { gte: startOfDay },
        },
        orderBy: { createdAt: 'desc' },
      });

      let nextNumber = 1;
      if (lastOrderToday) {
        // Ambil nomor dari notes [#01] atau 3 digit ID paling belakang
        const match = lastOrderToday.notes?.match(/\[#(\d+)\]/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          const parts = lastOrderToday.id.split('-');
          const lastSeq = parseInt(parts[parts.length - 1], 10);
          nextNumber = !isNaN(lastSeq) ? lastSeq + 1 : 1;
        }
      }

      const formattedQ = `#${String(nextNumber).padStart(2, '0')}`;
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const generatedOrderId = `SB-${yy}${mm}${dd}-${String(nextNumber).padStart(3, '0')}`;

      return NextResponse.json({
        success: true,
        queueNumber: nextNumber,
        formattedQ,
        generatedOrderId,
      });
    }

    // 3. Default: Seluruh Pesanan (urut terbaru)
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pesanan', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Simpan transaksi baru dari Kasir POS / Checkout
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, customerName, customerPhone, totalPrice, notes, items, status } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pesanan harus memiliki minimal 1 item' },
        { status: 400 }
      );
    }

    const cleanTotal = sanitizeNumber(totalPrice);

    const orderData = {
      customerName: customerName ? String(customerName).trim() : 'Pelanggan Walk-in',
      customerPhone: customerPhone ? String(customerPhone).trim() : '-',
      totalPrice: cleanTotal,
      status: (status || 'pending').toLowerCase(),
      notes: notes || null,
      items: {
        create: items.map((item) => ({
          menuName: item.name || 'Takoyaki',
          quantity: sanitizeNumber(item.quantity || item.qty) || 1,
          price: sanitizeNumber(item.price),
        })),
      },
    };

    if (id) {
      orderData.id = id;
    }

    const order = await prisma.order.create({
      data: orderData,
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mencatat pesanan ke database', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update status pesanan (diseragamkan ke lowercase)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID pesanan dan status wajib diisi' },
        { status: 400 }
      );
    }

    // Normalisasi status ke huruf kecil baku
    const normalizedStatus = String(status).toLowerCase();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: normalizedStatus },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus 1 pesanan ATAU Reset Total ke 0
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const resetAll = searchParams.get('reset_all');

    // Reset Total (Bersihkan semua order & item)
    if (resetAll === 'true') {
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: 'Seluruh pesanan berhasil di-reset menjadi 0' 
      });
    }

    // Hapus Satuan
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pesanan diperlukan' },
        { status: 400 }
      );
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pesanan', error: error.message },
      { status: 500 }
    );
  }
}