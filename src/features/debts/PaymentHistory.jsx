import { SketchCard } from '../../shared/components/SketchCard.jsx';
import { Grid } from '../../shared/components/Layout.jsx';
import { formatRupiah } from '../../shared/utils/money.js';

export function PaymentHistory({ payments }) {
  if (!payments.length) {
    return <p>Belum ada pembayaran yang dicatat.</p>;
  }
  return (
    <Grid gap={16}>
      {payments.map((payment) => (
        <SketchCard key={payment.id}>
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
          {payment.note ? <p>{payment.note}</p> : null}
        </SketchCard>
      ))}
    </Grid>
  );
}
