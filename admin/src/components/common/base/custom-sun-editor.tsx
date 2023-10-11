import 'suneditor/dist/css/suneditor.min.css';

import { settingService } from '@services/setting.service';
import {
  align,
  font,
  fontColor,
  fontSize,
  formatBlock,
  hiliteColor,
  horizontalRule,
  image,
  lineHeight,
  link,
  list,
  paragraphStyle,
  table,
  template,
  textStyle,
  video
} from 'suneditor/src/plugins';
import SunEditor from 'suneditor-react';

type ISunEditorProps = {
  onChange: Function;
  content: string;
  autoFocus?: boolean;
  editorRef?: any;
}

function CustomSunEditor({
  onChange, content, autoFocus = true, editorRef = null
}: ISunEditorProps) {
  const uploadPhoto = (files, info, uploadHandler) => {
    const formData = new FormData();
    formData.append('file', files[0], files[0].name);
    settingService.uploadFile(formData).then((resp) => uploadHandler({
      result: [{
        url: resp.data.url,
        name: resp.data.name
      }]
    }));
  };

  const setRef = (sunEditor) => {
    // eslint-disable-next-line no-param-reassign
    if (editorRef) editorRef.current = sunEditor;
  };

  return (
    <SunEditor
      onChange={(text) => onChange(text)}
      defaultValue={content}
      autoFocus={autoFocus}
      setOptions={{
        showPathLabel: false,
        minHeight: '50vh',
        maxHeight: '50vh',
        placeholder: 'Enter your content here!!!',
        plugins: [
          align,
          font,
          fontColor,
          fontSize,
          formatBlock,
          hiliteColor,
          horizontalRule,
          lineHeight,
          list,
          paragraphStyle,
          table,
          template,
          textStyle,
          image,
          link,
          video
        ],
        buttonList: [
          ['undo', 'redo'],
          ['font', 'fontSize', 'formatBlock'],
          ['paragraphStyle'],
          [
            'bold',
            'underline',
            'italic',
            'strike',
            'subscript',
            'superscript'
          ],
          ['fontColor', 'hiliteColor'],
          ['removeFormat'],
          '/', // Line break
          ['outdent', 'indent'],
          ['align', 'horizontalRule', 'list', 'lineHeight'],
          ['table', 'link', 'image'],
          ['video', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'print']
        ],
        formats: ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        font: [
          'Arial',
          'Calibri',
          'Comic Sans',
          'Courier',
          'Garamond',
          'Georgia',
          'Impact',
          'Lucida Console',
          'Palatino Linotype',
          'Segoe UI',
          'Tahoma',
          'Times New Roman',
          'Trebuchet MS'
        ]
      }}
      onImageUploadBefore={uploadPhoto}
      getSunEditorInstance={setRef}
    />
  );
}

export default CustomSunEditor;
