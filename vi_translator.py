import os
import glob
import importlib.util
import pprint

# Define translations for all UI strings and common messages
TRANSLATIONS = {
    # UI Strings
    'APPLY': 'ÁP DỤNG',
    'BENCHMARK MODE': 'CHẾ ĐỘ CHẤM ĐIỂM (BENCHMARK)',
    'BENCHMARK CYCLE COUNT': 'SỐ VÒNG CHẤM ĐIỂM',
    'BENCHMARK RESOLUTIONS': 'ĐỘ PHÂN GIẢI CHẤM ĐIỂM',
    'CLEAR': 'XÓA',
    'OPTIONS': 'TÙY CHỌN',
    'DOWNLOAD PROVIDERS': 'NGUỒN TẢI XUỐNG',
    'EXECUTION PROVIDERS': 'PHẦN CỨNG XỬ LÝ (CPU/GPU)',
    'EXECUTION THREAD COUNT': 'SỐ LUỒNG XỬ LÝ',
    'FACE DETECTOR ANGLES': 'GÓC DÒ TÌM KHUÔN MẶT',
    'FACE DETECTOR MODEL': 'MÔ HÌNH DÒ TÌM KHUÔN MẶT',
    'FACE DETECTOR MARGIN': 'LỀ DÒ TÌM KHUÔN MẶT',
    'FACE DETECTOR SCORE': 'ĐỘ TIN CẬY DÒ TÌM',
    'FACE DETECTOR SIZE': 'KÍCH THƯỚC DÒ TÌM',
    'FACE LANDMARKER MODEL': 'MÔ HÌNH ĐIỂM MỐC KHUÔN MẶT',
    'FACE LANDMARKER SCORE': 'ĐỘ TIN CẬY ĐIỂM MỐC',
    'FACE MASK BLUR': 'ĐỘ MỜ MẶT NẠ',
    'FACE MASK PADDING BOTTOM': 'ĐỆM MẶT NẠ DƯỚI',
    'FACE MASK PADDING LEFT': 'ĐỆM MẶT NẠ TRÁI',
    'FACE MASK PADDING RIGHT': 'ĐỆM MẶT NẠ PHẢI',
    'FACE MASK PADDING TOP': 'ĐỆM MẶT NẠ TRÊN',
    'FACE MASK AREAS': 'KHU VỰC MẶT NẠ',
    'FACE MASK REGIONS': 'VÙNG MẶT NẠ',
    'FACE MASK TYPES': 'LOẠI MẶT NẠ',
    'FACE SELECTOR AGE': 'TUỔI KHUÔN MẶT',
    'FACE SELECTOR GENDER': 'GIỚI TÍNH KHUÔN MẶT',
    'FACE SELECTOR MODE': 'CHẾ ĐỘ CHỌN KHUÔN MẶT',
    'FACE SELECTOR ORDER': 'THỨ TỰ CHỌN KHUÔN MẶT',
    'FACE SELECTOR RACE': 'CHỦNG TỘC KHUÔN MẶT',
    'FACE TRACKER SCORE': 'ĐỘ TIN CẬY THEO DÕI MẶT',
    'FACE OCCLUDER MODEL': 'MÔ HÌNH CHE MẶT',
    'FACE PARSER MODEL': 'MÔ HÌNH PHÂN TÍCH MẶT',
    'VOICE EXTRACTOR MODEL': 'MÔ HÌNH TÁCH GIỌNG NÓI',
    'JOB STATUS': 'TRẠNG THÁI CÔNG VIỆC',
    'JOB_ACTION': 'HÀNH ĐỘNG',
    'JOB ID': 'ID CÔNG VIỆC',
    'STEP INDEX': 'BƯỚC SỐ',
    'JOB ACTION': 'HÀNH ĐỘNG',
    'LOG LEVEL': 'MỨC ĐỘ LOG',
    'OUTPUT AUDIO ENCODER': 'BỘ MÃ HÓA ÂM THANH XUẤT',
    'OUTPUT AUDIO QUALITY': 'CHẤT LƯỢNG ÂM THANH XUẤT',
    'OUTPUT AUDIO VOLUME': 'ÂM LƯỢNG ÂM THANH XUẤT',
    'OUTPUT': 'ĐẦU RA (OUTPUT)',
    'OUTPUT IMAGE QUALITY': 'CHẤT LƯỢNG ẢNH XUẤT',
    'OUTPUT IMAGE SCALE': 'TỶ LỆ ẢNH XUẤT',
    'OUTPUT PATH': 'ĐƯỜNG DẪN XUẤT FILE',
    'OUTPUT VIDEO ENCODER': 'BỘ MÃ HÓA VIDEO XUẤT',
    'OUTPUT VIDEO FPS': 'FPS VIDEO XUẤT',
    'OUTPUT VIDEO PRESET': 'PRESET VIDEO XUẤT',
    'OUTPUT VIDEO QUALITY': 'CHẤT LƯỢNG VIDEO XUẤT',
    'OUTPUT VIDEO SCALE': 'TỶ LỆ VIDEO XUẤT',
    'PREVIEW FRAME': 'KHUNG HÌNH XEM TRƯỚC',
    'PREVIEW': 'XEM TRƯỚC (PREVIEW)',
    'PREVIEW MODE': 'CHẾ ĐỘ XEM TRƯỚC',
    'PREVIEW RESOLUTION': 'ĐỘ PHÂN GIẢI XEM TRƯỚC',
    'PROCESSORS': 'CÁC BỘ XỬ LÝ (PROCESSORS)',
    'REFERENCE FACE DISTANCE': 'KHOẢNG CÁCH MẶT THAM CHIẾU',
    'REFERENCE FACE': 'KHUÔN MẶT THAM CHIẾU',
    'REFRESH': 'LÀM MỚI (REFRESH)',
    'SOURCE': 'NGUỒN (SOURCE)',
    'START': 'BẮT ĐẦU',
    'STOP': 'DỪNG',
    'TARGET': 'MỤC TIÊU (TARGET)',
    'TEMP FRAME FORMAT': 'ĐỊNH DẠNG KHUNG HÌNH TẠM',
    'TERMINAL': 'BẢNG LỆNH (TERMINAL)',
    'TRIM FRAME': 'CẮT KHUNG HÌNH',
    'UI WORKFLOW': 'GIAO DIỆN LÀM VIỆC',
    'VIDEO MEMORY STRATEGY': 'CHIẾN LƯỢC BỘ NHỚ VIDEO (VRAM)',
    'WEBCAM FPS': 'FPS WEBCAM',
    'WEBCAM': 'WEBCAM',
    'WEBCAM DEVICE ID': 'ID THIẾT BỊ WEBCAM',
    'WEBCAM MODE': 'CHẾ ĐỘ WEBCAM',
    'WEBCAM RESOLUTION': 'ĐỘ PHÂN GIẢI WEBCAM',
    
    # Processors UIS
    'FACE SWAPPER MODEL': 'MÔ HÌNH HOÁN ĐỔI MẶT',
    'FACE SWAPPER PIXEL BOOST': 'TĂNG ĐỘ PHÂN GIẢI HOÁN ĐỔI',
    'FACE SWAPPER WEIGHT': 'TRỌNG SỐ HOÁN ĐỔI',
    'FACE ENHANCER MODEL': 'MÔ HÌNH LÀM NÉT MẶT',
    'FACE ENHANCER BLEND': 'ĐỘ HÒA TRỘN LÀM NÉT',
    'FRAME ENHANCER MODEL': 'MÔ HÌNH LÀM NÉT KHUNG HÌNH',
    'FRAME ENHANCER BLEND': 'ĐỘ HÒA TRỘN LÀM NÉT KHUNG',
    'LIP SYNCER MODEL': 'MÔ HÌNH GHÉP MÔI (LIP SYNC)',
    'BACKGROUND REMOVER MODEL': 'MÔ HÌNH XÓA NỀN',
    'BACKGROUND REMOVER COLOR': 'MÀU NỀN THAY THẾ',
    
    # Common words
    'choose an image for the source': 'chọn một hình ảnh làm nguồn (source)',
    'choose an audio for the source': 'chọn một âm thanh làm nguồn (source)',
    'choose a video for the target': 'chọn một video làm mục tiêu (target)',
    'choose an image or video for the target': 'chọn một hình ảnh hoặc video làm mục tiêu',
    'specify the output image or video within a directory': 'chỉ định thư mục xuất hình ảnh hoặc video',
    
    'fund ai workstation': 'tài trợ máy trạm ai',
    'become a member': 'trở thành hội viên',
    'join our community': 'tham gia cộng đồng'
}

def translate_dict(d):
    translated = {}
    for k, v in d.items():
        if isinstance(v, dict):
            translated[k] = translate_dict(v)
        elif isinstance(v, str):
            # Translate using exact match or case-insensitive match
            trans = TRANSLATIONS.get(v)
            if not trans:
                trans = TRANSLATIONS.get(v.upper())
            if not trans:
                trans = TRANSLATIONS.get(v.title())
            translated[k] = trans if trans else v
        else:
            translated[k] = v
    return translated

def process_locales(facefusion_path):
    import sys
    sys.path.insert(0, os.path.dirname(facefusion_path))
    search_pattern = os.path.join(facefusion_path, '**', 'locales.py')
    locales_files = glob.glob(search_pattern, recursive=True)
    
    for file_path in locales_files:
        print(f"Processing: {file_path}")
        
        # We need to import the file to get LOCALES
        spec = importlib.util.spec_from_file_location("dynamic_locales", file_path)
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
            en_locales = module.LOCALES.get('en')
            if not en_locales:
                print(f"  No 'en' locales found in {file_path}")
                continue
            
            # check if vi is already in file to avoid appending multiple times
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if "LOCALES['vi']" in content:
                    print(f"  Already contains 'vi'. Skipping.")
                    continue
            
            # Translate
            vi_locales = translate_dict(en_locales)
            
            # Format as string
            vi_str = pprint.pformat(vi_locales, indent=4, width=120)
            
            # Append to file
            with open(file_path, 'a', encoding='utf-8') as f:
                f.write(f"\n# Auto-generated Vietnamese Translation\nLOCALES['vi'] = \\\n{vi_str}\n")
                
            print(f"  Successfully added 'vi' to {file_path}")
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

if __name__ == "__main__":
    process_locales(r"E:\AI\AI_Local\facefusion\facefusion")
