// ============================================================================
// 
// データベース定数定義
// 
// ============================================================================

// ----------------------------------------------------------------------------
// 
// ----------------------------------------------------------------------------

// ====================================================================
// グループ
// ====================================================================

class tableGroup {
    // ToDo: 子クラスは static にすると利用時にアクセスできない
    // テーブル名
    t = "t_group";

    // カラム名
    cId = "group_id";
    cUuid = "group_uuid";
    cCreated = "group_created";
    cStatus = "group_status";
}

// ====================================================================
// グループメンバー
// ====================================================================

class tableMember {
    // テーブル名
    t = "t_member";

    // カラム名
    cId = "member_id";
    cGroup = "member_group";
    cSerial = "member_serial";
    cName = "member_name";
    cPlayOrder = "member_play_order";
    cStatus = "member_status";
}

// ====================================================================
// 全体
// ====================================================================

class dbConstants {
    // パス関連（起点となる .js からの相対パス）
    static folder = "./data/";
    static path = this.folder + "database.sqlite3";

    // 型
    static tInt = "integer";
    static tReal = "real";
    static tText = "text";

    // パラメーター
    static pAutoIncrement = "autoincrement";
    static pNotNull = "not null";
    static pPrimaryKey = "primary key";
    static pUnique = "unique";

    // テーブル
    static group = new tableGroup();
    static member = new tableMember();
}

module.exports = dbConstants;
