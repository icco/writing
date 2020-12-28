import Link from "next/link";
import Editor from "rich-markdown-editor";

import theme from "components/editorTheme";

export default function Comment(params) {
  const {
    className,
    data: { comment },
  } = params;

  return (
    <article className={className}>
      <div className="pv2 ph0-ns pb3-ns">
        <div className="f6 f5-ns mv1">
          <Link href={`/comments/${comment.id}`}>
            <a className="link dark-gray dim">{comment.created}</a>
          </Link>{" "}
          - {comment.user.name}
        </div>
        <Editor
          id="content"
          name="content"
          className="db border-box w-100 pa2 br2 mb2"
          aria-describedby="text-desc"
          defaultValue={comment.content}
          theme={theme}
          readonly={true}
        />
      </div>
    </article>
  );
}
