import { motion } from 'framer-motion';

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function FeatureCard({ title, description, icon }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-primary-600 transition-transform duration-300 group-hover:scale-110 [&>svg]:h-16 [&>svg]:w-16 sm:[&>svg]:h-20 sm:[&>svg]:w-20">
          {icon}
        </div>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}
