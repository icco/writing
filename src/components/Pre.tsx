import SyntaxHighlighter from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

type PreProps = {
  inline?: boolean
  className?: string
  children: React.ReactNode | string | string[]
}

const Pre: React.FC<PreProps> = ({ inline, className, children, ...props }) => {
  const hasLang = /language-(\w+)/.exec(className || "")
  return !inline && hasLang ? (
    <SyntaxHighlighter
      style={oneDark}
      language={hasLang[1]}
      PreTag="div"
      className="mockup-code scrollbar-thin scrollbar-track-base-content/5 scrollbar-thumb-base-content/40 scrollbar-track-rounded-md scrollbar-thumb-rounded"
      showLineNumbers={true}
      useInlineStyles={true}
    >
      {children?.toString().replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <pre className={className} {...props}>
      {children}
    </pre>
  )
}

export default Pre
