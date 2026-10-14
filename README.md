# VoiceNotes 主题双链转换（0.1.4）

作者：moneie  
项目主页：https://github.com/moneie/siyuan-voicenotes-topic-link

将从 VoiceNotes 复制的 `[[主题名]]` 转换为思源原生文档引用。仅当主题标题完全匹配且唯一时转换；未找到或存在重名时保留原文。普通文本粘贴不受影响。

## 安装

从本仓库的 Releases 下载 `siyuan-voicenotes-topic-link-0.1.4.zip`，解压后将 `siyuan-voicenotes-topic-link` 文件夹放入思源工作空间的 `data/plugins/` 目录，重启思源并启用插件。也可以在本地使用下方构建步骤生成安装包。

## 构建

需要安装 Node.js 和 npm，并能访问 npm registry。Windows 用户双击 `build.bat`，脚本会安装构建依赖、构建插件，并在项目目录生成 `siyuan-voicenotes-topic-link-0.1.4.zip`。

## 工作方式与限制

- 只转换标题完全匹配且唯一的文档。
- 未找到标题或有重名时保留原始 `[[主题名]]` 标记。
- 不会自动创建文档，也不会修改 VoiceNotes 原始笔记。
- 插件通过思源 SQL API 查询文档标题。
- 当前为思源桌面端插件，建议先在测试文档中验证，再用于重要笔记。

## 版本

### 0.1.4

- 将插件命名和界面提示统一为 VoiceNotes。
- 支持将唯一匹配的 `[[主题名]]` 转换为思源原生文档引用。
