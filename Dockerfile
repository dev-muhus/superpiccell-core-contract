# Node.jsの公式イメージをベースにする。バージョンはpackage.jsonと互換性のあるものを選ぶ
FROM node:16

# /appディレクトリを作成して作業ディレクトリとして設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# プロジェクトの依存関係をインストール。npm ciを利用してpackage-lock.jsonに基づいた正確なバージョンでインストール
RUN npm install

# プロジェクトのソースコードをコピー。.dockerignoreを使用してnode_modulesやローカル環境固有のファイルを除外
COPY . .

# コンテナが起動したときに実行されるコマンド。開発用サーバーを起動します。
CMD ["tail", "-f", "/dev/null"]
