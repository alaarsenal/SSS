export default class CollectionUtils {

  static isBlank(array:any[]):boolean {
    return !array || array.length == 0;
  }

  static isNotBlank(array:any[]):boolean {
    return !this.isBlank(array);
  }

  static sort(array: any[], desc?: boolean): any[] {
    if (this.isNotBlank(array)) {
      return desc
        ? array.sort((v1, v2) => v1 > v2 ? -1 : 1)
        : array.sort((v1, v2) => v1 > v2 ? 1 : -1)
    }
    return array;
  }

  static sortByKey(array: any[], key: string, desc?: boolean): any[] {
    if (this.isNotBlank(array) && key && array[0][key]) {
      return desc
        ? array.sort((v1, v2) => v1[key] > v2[key] ? -1 : 1)
        : array.sort((v1, v2) => v1[key] > v2[key] ? 1 : -1)
    }
    return array;
  }

  static compareMaps(map1, map2) {
    if(!map1 || !map2) {
      return false;
    }
    var testVal;
    if (map1.size !== map2.size) {
      return false;
    }
    for (var [key, val] of map1) {
      testVal = map2.get(key);
      // in cases of an undefined value, make sure the key
      // actually exists on the object so there are no false positives
      if (JSON.stringify(testVal) !== JSON.stringify(val) || (testVal === undefined && !map2.has(key))) {
        return false;
      }
    }
    return true;
  }

  static isMapValuesEmpty(map: Map<any, any>): boolean {
    if (!map) {
      return true;
    }
    for (var [key, val] of map) {
      if (val) {
        return false;
      }
    }
    return true;
  }

}
