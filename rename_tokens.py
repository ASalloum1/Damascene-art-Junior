import os

replacements = {
    "--color-wood-dark": "--color-gold-dark",
    "--color-wood-mid": "--color-gold",
    "--color-wood-light": "--color-gold-light",
    "--color-wood-faint": "--color-gold-bg",
    "--color-ivory-mid": "--color-cream-dark",
    "--color-ivory-dark": "--color-cream-mid",
    "--color-ivory-deep": "--color-cream-deep",
    "--color-ivory": "--color-cream",
    "--color-ink-soft": "--color-navy-light",
    "--color-ink": "--color-navy",
    "--color-success-bg": "--color-green-bg",
    "--color-success": "--color-green",
    "--color-warning-bg": "--color-orange-bg",
    "--color-warning": "--color-orange",
    "--color-error-bg": "--color-red-bg",
    "--color-error": "--color-red",
    "--color-info-bg": "--color-blue-bg",
    "--color-info": "--color-blue",
    "#f0d5d5": "var(--color-red-bg)",
}

dirs = ["frontend/store-manager-dashboard/src", "frontend/customer-guest/src"]
for directory in dirs:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".css"):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}")
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    for old, new in replacements.items():
                        content = content.replace(old, new)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
