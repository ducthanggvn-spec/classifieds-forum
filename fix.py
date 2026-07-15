import os
import glob

def fix_files(facefusion_path):
    search_pattern = os.path.join(facefusion_path, '**', 'locales.py')
    locales_files = glob.glob(search_pattern, recursive=True)
    
    for file_path in locales_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # The literal string that was incorrectly written
        bad_str = "\\n# Auto-generated Vietnamese Translation"
        idx = content.find(bad_str)
        
        if idx != -1:
            content = content[:idx]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {file_path}")

if __name__ == "__main__":
    fix_files(r"E:\AI\AI_Local\facefusion\facefusion")
