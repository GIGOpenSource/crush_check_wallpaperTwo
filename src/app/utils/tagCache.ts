import type { Tag } from '../types';

/**
 * 标签缓存管理器
 * 用于维护标签名称到ID的映射关系
 */
class TagCacheManager {
  private nameToIdMap = new Map<string, string>();
  private idToNameMap = new Map<string, string>();
  
  /**
   * 批量添加标签映射
   */
  addTags(tags: Tag[]) {
    for (const tag of tags) {
      if (tag.name && tag.id) {
        this.nameToIdMap.set(tag.name, tag.id);
        this.idToNameMap.set(tag.id, tag.name);
      }
    }
  }
  
  /**
   * 根据标签名称获取ID
   * @param name 标签名称
   * @returns 标签ID，如果未找到则返回undefined
   */
  getIdByName(name: string): string | undefined {
    return this.nameToIdMap.get(name);
  }
  
  /**
   * 根据标签ID获取名称
   * @param id 标签ID
   * @returns 标签名称，如果未找到则返回undefined
   */
  getNameById(id: string): string | undefined {
    return this.idToNameMap.get(id);
  }
  
  /**
   * 清除缓存
   */
  clear() {
    this.nameToIdMap.clear();
    this.idToNameMap.clear();
  }
}

// 导出单例实例
export const tagCache = new TagCacheManager();
