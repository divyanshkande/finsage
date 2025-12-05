import os

# Use CURRENT FOLDER where rename.py is located
BASE_DIR = "."

folders = ["pen", "bottle", "bag"]

for folder in folders:
    path = os.path.join(BASE_DIR, folder)

    if not os.path.exists(path):
        print(f"❌ Folder not found: {path}")
        continue

    files = os.listdir(path)
    files.sort()

    for i, file in enumerate(files, start=1):
        ext = file.split(".")[-1]
        new_name = f"{folder}_{i:03d}.{ext}"

        old_path = os.path.join(path, file)
        new_path = os.path.join(path, new_name)

        os.rename(old_path, new_path)

    print(f"✅ Renamed {len(files)} files in {folder} folder.")
