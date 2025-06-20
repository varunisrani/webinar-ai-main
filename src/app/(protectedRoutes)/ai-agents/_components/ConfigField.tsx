import type { ReactNode } from "react"
import { Info } from "lucide-react"

interface Props {
  label: string
  showInfo?: boolean
  children: ReactNode
}

const ConfigField = ({ label, showInfo = false, children }: Props) =>{
  return (
    <div>
      <div className="flex items-center mb-2">
        <label className="font-medium">{label}</label>
        {showInfo && <Info className="h-4 w-4 text-neutral-500 ml-2" />}
      </div>
      {children}
    </div>
  )
}

export default ConfigField;
