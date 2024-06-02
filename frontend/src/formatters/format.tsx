/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import vkbeautify from 'vkbeautify';
import hljs from 'highlight.js';
import { ReactNode } from 'react';
import { DataFormat } from '@/types/types';
import 'highlight.js/styles/default.css';

interface Formatter {
  format(data: string): string | ReactNode;
}

function highlight(data: string, format: string) {
  try {
    const result =
      hljs.highlight(data, {
        language: format,
        ignoreIllegals: true,
      })?.value || data;
    // eslint-disable-next-line react/no-danger
    return <code dangerouslySetInnerHTML={{ __html: result || '' }} />;
  } catch (error) {
    return data;
  }
}

class JSONFormatter implements Formatter {
  format(data: string) {
    try {
      const jsonData = JSON.parse(data);
      const formatted = vkbeautify.json(jsonData);
      return highlight(formatted, 'json');
    } catch (error) {
      return 'Failed to format JSON: Error parsing data';
    }
  }
}

// Implement XML formatter
class XMLFormatter implements Formatter {
  format(data: string) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        return 'Failed to format XML: Error parsing data';
      }
      const formatted = vkbeautify.xml(
        new XMLSerializer().serializeToString(xmlDoc)
      );
      return highlight(formatted, 'xml');
    } catch (error) {
      return 'Failed to format XML: Error parsing data';
    }
  }
}

// Implement hexadecimal formatter
class HexFormatter implements Formatter {
  format(data: string) {
    try {
      let result = '';

      for (let i = 0; i < data.length; i += 1) {
        const hex = data.charCodeAt(i).toString(16);
        result += `${`000${hex}`.slice(-4)} `;
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
  private formatters: { [key: string]: Formatter } = {
    JSON: new JSONFormatter(),
    XML: new XMLFormatter(),
    HEX: new HexFormatter(),
    TEXT: new TextFormatter(),
  };

  format(data: unknown, format: DataFormat) {
    const formatter = this.formatters[format];
    try {
      if (data == null) {
        return 'No data to format';
      }
      if (data && typeof data === 'object') {
        const jsonString = JSON.stringify(data);
        return formatter.format(jsonString);
      }
    } catch (error) {
      //  'Failed to format: Error parsing data';
    }

    if (formatter) {
      return formatter.format(data as string);
    }
    return 'Failed to format: Unsupported format';
  }
}

export const formatter = new FormatterAdapter();
