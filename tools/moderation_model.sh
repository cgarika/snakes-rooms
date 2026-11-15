#!/bin/bash
# Fetches moderation.js's model: unitary/toxic-bert (Apache-2.0) as Xenova's int8 ONNX, from Hugging Face, into the
# Mac's GameNest cache (one copy for every server). Usage: tools/moderation_model.sh
set -euo pipefail
DEST=${MODERATION_MODEL_DIR:-$HOME/Library/GameNest/Cache/moderation/toxic-bert}
mkdir -p "$DEST"
TOKEN=$( [ -f "$HOME/Library/GameNest/Cache/huggingface/token" ] && cat "$HOME/Library/GameNest/Cache/huggingface/token" || true)
REV=${TOXIC_BERT_REV:-65cbc2607cb7fad64f98d1e8a5a3d1f8577895fd}   # the revision tested (2026-10-18)
for f in onnx/model_quantized.onnx config.json vocab.txt; do
  [ -s "$DEST/$(basename $f)" ] && continue
  curl -sfL ${TOKEN:+-H "Authorization: Bearer $TOKEN"} -o "$DEST/$(basename $f).part" "https://huggingface.co/Xenova/toxic-bert/resolve/$REV/$f"
  mv "$DEST/$(basename $f).part" "$DEST/$(basename $f)"
done
echo "$(shasum -a 256 "$DEST/model_quantized.onnx" | cut -c1-16)  $DEST/model_quantized.onnx"
