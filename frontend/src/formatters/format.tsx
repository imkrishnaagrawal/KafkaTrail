import {DATA_FORMAT} from '@/types/types';
import vkbeautify from 'vkbeautify';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
interface Formatter {
  format(data: string): string;
  // highlight(data: string): string;
}

function highlight(data: string, format: string): any {
  try {
    const result =
      hljs.highlight(data, {
        language: format,
        ignoreIllegals: true,
      })?.value || data;
    return (
      <code dangerouslySetInnerHTML={{__html: result ? result : ''}}></code>
    );
  } catch (error) {
    return data;
  }
}

class JSONFormatter implements Formatter {
  format(data: string): string {
    try {
      const jsonData = JSON.parse(data);
      let formatted = vkbeautify.json(jsonData);
      return highlight(formatted, 'json');
    } catch (error) {
      return 'Failed to format JSON: Error parsing data';
    }
  }
}

// Implement XML formatter
class XMLFormatter implements Formatter {
  format(data: string): string {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        return 'Failed to format XML: Error parsing data';
      } else {
        let formatted = vkbeautify.xml(
          new XMLSerializer().serializeToString(xmlDoc)
        );
        return highlight(formatted, 'xml');
      }
    } catch (error) {
      return 'Failed to format XML: Error parsing data';
    }
  }
}

// Implement hexadecimal formatter
class HexFormatter implements Formatter {
  format(data: string): string {
    try {
      var result = '';

      for (let i = 0; i < data.length; i++) {
        let hex = data.charCodeAt(i).toString(16);
        result += ('000' + hex).slice(-4) + ' ';
      }
      return result;
    } catch (error) {
      return 'Failed to format HEX: Error parsing data';
    }
  }
}

class TextFormatter implements Formatter {
  format(data: string): string {
    return data;
  }
}

// Adapter class that delegates formatting to specific formatters based on format type
class FormatterAdapter {
  private formatters: {[key: string]: Formatter} = {
    JSON: new JSONFormatter(),
    XML: new XMLFormatter(),
    HEX: new HexFormatter(),
    TEXT: new TextFormatter(),
  };
  // format(data: string): string {
  //   return this.formatWithType(data, 'json');
  // }
  format(data: any, format: DATA_FORMAT): string {
    try {
      if (data == null) {
        return 'No data to format';
      }
      if (data && typeof data === 'object') {
        data = JSON.stringify(data);
      }
    } catch (error) {}
    const formatter = this.formatters[format];
    if (formatter) {
      return formatter.format(data);
    } else {
      return 'Failed to format: Unsupported format';
    }
  }
}

export const formatter = new FormatterAdapter();
