import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

export function PaymentHistory({ payments }) {
  if (!payments.length) {
    return <p className="m-0">Belum ada pembayaran yang dicatat.</p>;
  }
  return (
    <div className="grid gap-3">
      {payments.map((payment) => (
        <SketchCard className="p-3" key={payment.id}>
          <div className="flex flex-wrap justify-between gap-2">
            <strong>{formatRupiah(payment.amount)}</strong>
            <time dateTime={payment.paidAt?.toISOString()}>
              {payment.paidAt
                ? new Intl.DateTimeFormat('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(payment.paidAt)
                : 'Tanggal tidak tersedia'}
            </time>
          </div>
          {payment.note ? <p className="mt-1 mb-0">{payment.note}</p> : null}
        </SketchCard>
      ))}
    </div>
  );
}
