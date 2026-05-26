import { Editor } from '@tinymce/tinymce-react';

type TinyEditorProps = {
  value: string;
  onChange: (content: string) => void;
};

const TinyEditor = ({ value, onChange }: TinyEditorProps) => {
  return (
  <Editor
    tinymceScriptSrc="/tinymce/tinymce.min.js"
    licenseKey="gpl"
    value={value}
    onEditorChange={(content) => onChange(content)}
    init={{
      height: 600,

      skin_url: '/tinymce/skins/ui/oxide-dark',
      content_css: false,

      plugins: 'lists link image table code preview',
      toolbar:
        'undo redo | blocks | bold italic underline | ' +
        'alignleft aligncenter alignright | bullist numlist | ' +
        'forecolor backcolor | link image | code preview',

      content_style: `
        body {
          background-color: #1e1e1e;
          color: #f1f1f1;
          font-family: Arial, sans-serif;
          font-size: 16px;
          line-height: 1.7;
          padding: 15px;
        }

        h1,h2,h3,h4,h5,h6 {
          color: white;
        }

        a {
          color: #4ea1ff;
        }

        blockquote {
          border-left: 3px solid #666;
          margin-left: 0;
          padding-left: 12px;
          color: #ccc;
        }
      `
    }}
  />
  );
};

export default TinyEditor;