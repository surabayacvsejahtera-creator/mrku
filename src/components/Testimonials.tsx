import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Budi Santoso", role: "Pengusaha, Surabaya", text: "Pengiriman ke Ambon selalu tepat waktu 4 hari. Barang sampai aman. Sangat recommended!" },
  { name: "Sari Dewi", role: "Pemilik Toko Online", text: "Harga sangat terjangkau dibanding ekspedisi lain. Pelayanan ramah dan profesional." },
  { name: "Ahmad Rizki", role: "Supplier, Jakarta", text: "Sudah berlangganan 2 tahun kirim barang ke Papua. Tidak pernah ada masalah. Top!" },
];

const Testimonials = () => (
  <SectionWrapper className="gradient-light">
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        Apa Kata <span className="text-gradient-blue">Pelanggan Kami</span>
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {testimonials.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass-white rounded-3xl p-7 hover-lift relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 gradient-blue" />
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-primary-foreground font-bold text-sm">
              {t.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

export default Testimonials;
