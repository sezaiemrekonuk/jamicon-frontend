import { Gamepad2Icon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <motion.div 
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Gamepad2Icon className="h-16 w-16 text-primary" />
        </motion.div>
      </motion.div>
    </div>
  )
}
