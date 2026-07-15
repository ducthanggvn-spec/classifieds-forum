export function parseBBCode(text: string) {
  if (!text) return "";
  let html = text
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong class='font-bold'>$1</strong>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em class='italic'>$1</em>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u class='underline'>$1</u>")
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<del class='line-through'>$1</del>")
    .replace(/\[color=(.*?)\]([\s\S]*?)\[\/color\]/gi, "<span style='color:$1'>$2</span>")
    .replace(/\[size=(.*?)\]([\s\S]*?)\[\/size\]/gi, (match, size, content) => {
      const sizeMap: Record<string, string> = {
        '1': '0.75rem', '2': '0.875rem', '3': '1rem', '4': '1.25rem', '5': '1.5rem', '6': '2rem'
      };
      const fontSize = sizeMap[size] || '1rem';
      return `<span style='font-size:${fontSize}'>${content}</span>`;
    })
    .replace(/\[align=(left|center|right|justify)\]([\s\S]*?)\[\/align\]/gi, "<div style='text-align:$1'>$2</div>")
    .replace(/\[url\](.*?)\[\/url\]/gi, "<a href='$1' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:underline'>$1</a>")
    .replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, "<a href='$1' target='_blank' rel='noopener noreferrer' class='text-blue-600 hover:underline'>$2</a>")
    .replace(/\[img\](.*?)\[\/img\]/gi, "<img src='$1' alt='User image' class='bbcode-image cursor-zoom-in inline-block max-w-full sm:max-w-xs md:max-w-sm max-h-64 object-cover rounded m-1 border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity' loading='lazy' />")
    .replace(/\[youtube\](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)(.*?)\[\/youtube\]/gi, "<div class='aspect-w-16 aspect-h-9 my-3'><iframe src='https://www.youtube.com/embed/$1' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen class='w-full max-w-2xl h-64 md:h-96 rounded'></iframe></div>")
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "<pre class='bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto my-3'><code>$1</code></pre>")
    .replace(/\n/g, "<br />");

  // Xử lý nested quotes bằng vòng lặp (parse từ trong ra ngoài)
  let previous = "";
  while (html !== previous) {
    previous = html;
    html = html.replace(/\[quote=([^\]]+)\]((?:(?!\[\/?quote).)*?)\[\/quote\]/gi, (match, name, content) => {
      return `<blockquote class='bbcode-quote border-l-[3px] border-[#3b82f6] bg-[#f8fafc] dark:bg-[#1e293b] px-3 py-2 mt-2 mb-3 rounded-r-md text-[13px] text-gray-700 dark:text-gray-300 shadow-sm'><div class='font-bold text-[#2563eb] dark:text-blue-400 text-xs mb-1 uppercase tracking-wide'>${name} viết:</div><div class='italic'>${content}</div></blockquote>`;
    });
    html = html.replace(/\[quote\]((?:(?!\[\/?quote).)*?)\[\/quote\]/gi, (match, content) => {
      return `<blockquote class='bbcode-quote border-l-[3px] border-gray-400 bg-[#f8fafc] dark:bg-[#1e293b] px-3 py-2 mt-2 mb-3 rounded-r-md text-[13px] text-gray-700 dark:text-gray-300 italic shadow-sm'>${content}</blockquote>`;
    });
  }

  return html;
}
